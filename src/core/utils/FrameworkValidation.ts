import type { FrameworkConfiguration } from "../../../configs/types/FrameworkConfig.types";
import {
  isProductionOptInValid,
  resolveEnvironmentName,
} from "./EnvironmentResolver";

const requiredEnvironmentVariables = [
  "BASE_URL",
  "API_URL",
  "USERNAME",
  "PASSWORD",
  "HEADLESS",
] as const;

export function validateFrameworkInputs(
  environmentName: string,
  environment: NodeJS.ProcessEnv,
  config: FrameworkConfiguration,
): string[] {
  const issues: string[] = [];

  const resolvedName = resolveEnvironmentName(
    environmentName,
    config.environment.default,
  );
  if (!resolvedName) {
    issues.push(
      "FRAMEWORK_ENV must be local, dev, qa, uat, staging, or production (prod is a supported alias).",
    );
  }

  if (
    resolvedName &&
    !isProductionOptInValid(resolvedName, environment, config)
  ) {
    issues.push(
      `Production execution is blocked. Set ${config.environment.productionSafety.optInEnvironmentVariable}=true to continue.`,
    );
  }

  for (const [name, value] of Object.entries(config.reporter)) {
    if (typeof value !== "boolean") {
      issues.push(`reporter.${name} must be a boolean.`);
    }
  }

  if (!["off", "on", "only-on-failure"].includes(config.artifacts.screenshot)) {
    issues.push("artifacts.screenshot has an unsupported value.");
  }
  if (!["off", "on", "retain-on-failure"].includes(config.artifacts.video)) {
    issues.push("artifacts.video has an unsupported value.");
  }
  if (
    !["off", "on", "retain-on-failure", "on-first-retry"].includes(
      config.artifacts.trace,
    )
  ) {
    issues.push("artifacts.trace has an unsupported value.");
  }
  if (
    typeof config.execution.fullyParallel !== "boolean" ||
    typeof config.execution.forbidOnlyInCI !== "boolean"
  ) {
    issues.push("execution flags must be booleans.");
  }

  const missingVariables = requiredEnvironmentVariables.filter(
    (key) => !environment[key]?.trim(),
  );
  if (missingVariables.length > 0) {
    issues.push(
      `Missing required environment variables: ${missingVariables.join(", ")}.`,
    );
  }

  for (const key of ["BASE_URL", "API_URL"] as const) {
    const rawUrl = environment[key]?.trim();
    if (rawUrl && !isValidApplicationUrl(rawUrl)) {
      issues.push(
        `${key} must be an absolute HTTP or HTTPS URL without embedded credentials.`,
      );
    }
  }

  const headless = environment.HEADLESS?.trim().toLowerCase();
  if (headless && headless !== "true" && headless !== "false") {
    issues.push("HEADLESS must be either true or false.");
  }

  const positiveValues: Array<[string, number]> = [
    ["timeout.test", config.timeout.test],
    ["timeout.action", config.timeout.action],
    ["timeout.navigation", config.timeout.navigation],
    ["timeout.expect", config.timeout.expect],
    [
      "globalLifecycle.healthCheck.timeout",
      config.globalLifecycle.healthCheck.timeout,
    ],
    ["browser.viewport.width", config.browser.viewport.width],
    ["browser.viewport.height", config.browser.viewport.height],
  ];
  for (const [name, value] of positiveValues) {
    if (!Number.isFinite(value) || value <= 0) {
      issues.push(`${name} must be a positive finite number.`);
    }
  }

  if (
    !Number.isInteger(config.globalLifecycle.healthCheck.expectedStatus) ||
    config.globalLifecycle.healthCheck.expectedStatus < 100 ||
    config.globalLifecycle.healthCheck.expectedStatus > 599
  ) {
    issues.push(
      "globalLifecycle.healthCheck.expectedStatus must be an HTTP status code from 100 through 599.",
    );
  }

  if (!["chromium", "firefox", "webkit"].includes(config.browser.browserName)) {
    issues.push("browser.browserName must be chromium, firefox, or webkit.");
  }

  for (const [name, value] of [
    ["workers.local", config.workers.local],
    ["workers.ci", config.workers.ci],
  ] as const) {
    const validNumber =
      typeof value === "number" && Number.isInteger(value) && value > 0;
    const validPercentage =
      typeof value === "string" &&
      /^\d+%$/.test(value) &&
      Number.parseInt(value, 10) > 0;
    if (!validNumber && !validPercentage) {
      issues.push(
        `${name} must be a positive integer or a positive percentage string.`,
      );
    }
  }

  if (
    !resolveEnvironmentName(
      config.environment.default,
      config.environment.default,
    )
  ) {
    issues.push(
      "environment.default must be a supported framework environment.",
    );
  }

  for (const [environmentName, profile] of Object.entries(
    config.environment.profiles,
  )) {
    if (
      !resolveEnvironmentName(environmentName, config.environment.default) ||
      !profile
    ) {
      issues.push(`Environment profile '${environmentName}' is invalid.`);
      continue;
    }
    validateExecutionOverrides(
      `environment.profiles.${environmentName}`,
      profile,
      issues,
    );
    if (profile.ci) {
      validateExecutionOverrides(
        `environment.profiles.${environmentName}.ci`,
        profile.ci,
        issues,
      );
    }
  }

  const productionSafety = config.environment.productionSafety;
  if (
    !isEnvironmentVariableName(productionSafety.optInEnvironmentVariable) ||
    !isEnvironmentVariableName(
      productionSafety.destructiveOptInEnvironmentVariable,
    )
  ) {
    issues.push(
      "Production safety opt-in settings must use valid environment variable names.",
    );
  }

  for (const [name, value] of [
    ["retry.local", config.retry.local],
    ["retry.ci", config.retry.ci],
  ] as const) {
    if (!Number.isInteger(value) || value < 0) {
      issues.push(`${name} must be a non-negative integer.`);
    }
  }

  if (
    config.globalLifecycle.healthCheck.enabled &&
    config.globalLifecycle.healthCheck.endpoint.trim().length === 0
  ) {
    issues.push(
      "A health-check endpoint is required when the global health check is enabled.",
    );
  }

  if (
    config.globalLifecycle.healthCheck.endpoint &&
    (!config.globalLifecycle.healthCheck.endpoint.startsWith("/") ||
      config.globalLifecycle.healthCheck.endpoint.startsWith("//") ||
      config.globalLifecycle.healthCheck.endpoint.includes("?"))
  ) {
    issues.push(
      "The health-check endpoint must be a root-relative path without a query string.",
    );
  }

  if (
    config.globalLifecycle.testData.strategy === "module" &&
    config.globalLifecycle.testData.modulePath.trim().length === 0
  ) {
    issues.push(
      "A test-data strategy modulePath is required when the module strategy is selected.",
    );
  }

  if (config.globalLifecycle.metadataPath.trim().length === 0) {
    issues.push("globalLifecycle.metadataPath must not be empty.");
  }

  const auth = config.authentication;
  if (auth.enabled) {
    if (!["ui", "api", "custom"].includes(auth.strategy)) {
      issues.push("authentication.strategy must be ui, api, or custom.");
    }
    if (!auth.sessionDirectory.trim()) {
      issues.push(
        "authentication.sessionDirectory must not be empty when authentication is enabled.",
      );
    }
    if (
      !Number.isFinite(auth.sessionLifetimeSeconds) ||
      auth.sessionLifetimeSeconds <= 0
    ) {
      issues.push("authentication.sessionLifetimeSeconds must be positive.");
    }
    if (
      !Number.isFinite(auth.expirationSkewSeconds) ||
      auth.expirationSkewSeconds < 0
    ) {
      issues.push("authentication.expirationSkewSeconds must be non-negative.");
    }
    if (
      !Object.values(auth.users).every(
        (user) =>
          isEnvironmentVariableName(user.usernameEnv) &&
          isEnvironmentVariableName(user.passwordEnv) &&
          (!user.userIdEnv || isEnvironmentVariableName(user.userIdEnv)),
      )
    ) {
      issues.push(
        "Authentication role mappings must reference valid environment variable names.",
      );
    }
    if (auth.strategy === "ui") {
      const requiredUiValues = [
        auth.ui.loginPath,
        auth.ui.usernameSelector,
        auth.ui.passwordSelector,
        auth.ui.submitSelector,
        auth.ui.authenticatedSelector,
      ];
      if (requiredUiValues.some((value) => !value.trim())) {
        issues.push(
          "UI authentication requires a login path and configured login and authenticated-state selectors.",
        );
      }
      if (
        auth.ui.validationPath &&
        (!auth.ui.validationPath.startsWith("/") ||
          auth.ui.validationPath.startsWith("//") ||
          auth.ui.validationPath.includes("?"))
      ) {
        issues.push(
          "UI authentication validationPath must be a root-relative path without a query string.",
        );
      }
    }
    if (auth.strategy === "api") {
      if (
        !auth.api.loginEndpoint.startsWith("/") ||
        auth.api.loginEndpoint.startsWith("//") ||
        auth.api.loginEndpoint.includes("?")
      ) {
        issues.push(
          "API authentication loginEndpoint must be a root-relative path without a query string.",
        );
      }
      if (!auth.api.tokenJsonPath.trim() || !auth.api.tokenHeaderName.trim()) {
        issues.push(
          "API authentication requires tokenJsonPath and tokenHeaderName.",
        );
      }
      if (
        auth.api.sessionValidationEndpoint &&
        (!auth.api.sessionValidationEndpoint.startsWith("/") ||
          auth.api.sessionValidationEndpoint.startsWith("//") ||
          auth.api.sessionValidationEndpoint.includes("?"))
      ) {
        issues.push(
          "API authentication sessionValidationEndpoint must be a root-relative path without a query string.",
        );
      }
      if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(auth.api.tokenHeaderName)) {
        issues.push(
          "API authentication tokenHeaderName must be a valid HTTP header name.",
        );
      }
      if (/[\r\n]/.test(auth.api.tokenHeaderName + auth.api.tokenPrefix)) {
        issues.push(
          "API authentication header configuration contains invalid line breaks.",
        );
      }
      if (!containsCredentialTemplates(auth.api.requestPayload)) {
        issues.push(
          "API authentication requestPayload must include {{username}} and {{password}} placeholders.",
        );
      }
    }
  }

  return issues;
}

export function isSupportedFrameworkEnvironment(
  environmentName: string,
): boolean {
  return resolveEnvironmentName(environmentName, "qa") !== undefined;
}

function isEnvironmentVariableName(value: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

function containsCredentialTemplates(value: unknown): boolean {
  const serialized = JSON.stringify(value) ?? "";
  return (
    serialized.includes("{{username}}") && serialized.includes("{{password}}")
  );
}

function validateExecutionOverrides(
  name: string,
  profile: {
    retries?: number;
    workers?: number | string;
    fullyParallel?: boolean;
  },
  issues: string[],
): void {
  if (
    profile.retries !== undefined &&
    (!Number.isInteger(profile.retries) || profile.retries < 0)
  ) {
    issues.push(`${name}.retries must be a non-negative integer.`);
  }
  if (profile.workers !== undefined) {
    const validNumber =
      typeof profile.workers === "number" &&
      Number.isInteger(profile.workers) &&
      profile.workers > 0;
    const validPercentage =
      typeof profile.workers === "string" &&
      /^\d+%$/.test(profile.workers) &&
      Number.parseInt(profile.workers, 10) > 0;
    if (!validNumber && !validPercentage) {
      issues.push(
        `${name}.workers must be a positive integer or percentage string.`,
      );
    }
  }
  if (
    profile.fullyParallel !== undefined &&
    typeof profile.fullyParallel !== "boolean"
  ) {
    issues.push(`${name}.fullyParallel must be a boolean.`);
  }
}

function isValidApplicationUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.hostname.length > 0 &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}
