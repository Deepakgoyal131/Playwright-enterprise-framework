import type {
  EnvironmentExecutionProfile,
  FrameworkConfiguration,
  FrameworkEnvironmentName,
} from "../../../configs/types/FrameworkConfig.types";

const supportedEnvironments = new Set<FrameworkEnvironmentName>([
  "local",
  "dev",
  "qa",
  "uat",
  "staging",
  "production",
]);

const environmentAliases: Readonly<Record<string, FrameworkEnvironmentName>> = {
  prod: "production",
};

export function resolveEnvironmentName(
  requestedName: string | undefined,
  defaultName: FrameworkEnvironmentName,
): FrameworkEnvironmentName | undefined {
  const normalized = requestedName?.trim().toLowerCase();
  if (!normalized) {
    return supportedEnvironments.has(defaultName) ? defaultName : undefined;
  }
  if (normalized && Object.hasOwn(environmentAliases, normalized)) {
    return environmentAliases[normalized];
  }
  return supportedEnvironments.has(normalized as FrameworkEnvironmentName)
    ? (normalized as FrameworkEnvironmentName)
    : undefined;
}

export function resolveEnvironmentFileName(
  environment: FrameworkEnvironmentName,
): string {
  return environment === "production" ? ".env.prod" : `.env.${environment}`;
}

export function resolveExecutionProfile(
  environment: FrameworkEnvironmentName,
  isCI: boolean,
  config: FrameworkConfiguration,
): Required<
  Pick<EnvironmentExecutionProfile, "retries" | "workers" | "fullyParallel">
> {
  const profile = config.environment.profiles[environment];
  const overrides = isCI ? profile?.ci : undefined;
  return {
    retries:
      overrides?.retries ??
      profile?.retries ??
      (isCI ? config.retry.ci : config.retry.local),
    workers:
      overrides?.workers ??
      profile?.workers ??
      (isCI ? config.workers.ci : config.workers.local),
    fullyParallel:
      overrides?.fullyParallel ??
      profile?.fullyParallel ??
      config.execution.fullyParallel,
  };
}

export function isProductionEnvironment(
  environment: FrameworkEnvironmentName,
): boolean {
  return environment === "production";
}

export function isProductionOptInValid(
  environment: FrameworkEnvironmentName,
  environmentVariables: NodeJS.ProcessEnv,
  config: FrameworkConfiguration,
): boolean {
  const safety = config.environment.productionSafety;
  return (
    !safety.enabled ||
    !safety.requireExplicitOptIn ||
    !isProductionEnvironment(environment) ||
    environmentVariables[safety.optInEnvironmentVariable]?.toLowerCase() ===
      "true"
  );
}

export function shouldExcludeDestructiveProductionTests(
  environment: FrameworkEnvironmentName,
  environmentVariables: NodeJS.ProcessEnv,
  config: FrameworkConfiguration,
): boolean {
  const safety = config.environment.productionSafety;
  if (
    !safety.enabled ||
    !safety.excludeDestructiveTests ||
    !isProductionEnvironment(environment)
  ) {
    return false;
  }

  return !(
    safety.allowDestructiveTests &&
    environmentVariables[
      safety.destructiveOptInEnvironmentVariable
    ]?.toLowerCase() === "true"
  );
}
