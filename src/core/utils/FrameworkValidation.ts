import type { FrameworkConfiguration } from "../../../configs/types/FrameworkConfig.types";

const supportedEnvironments = new Set(["dev", "qa", "uat", "prod"]);
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

  if (!supportedEnvironments.has(environmentName)) {
    issues.push("FRAMEWORK_ENV must be one of: dev, qa, uat, prod.");
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

  return issues;
}

export function isSupportedFrameworkEnvironment(
  environmentName: string,
): boolean {
  return supportedEnvironments.has(environmentName);
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
