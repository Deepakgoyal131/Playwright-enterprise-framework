import { expect, test } from "@playwright/test";
import { FrameworkConfig } from "../../configs/FrameworkConfig";
import type { FrameworkConfiguration } from "../../configs/types/FrameworkConfig.types";
import { validateFrameworkInputs } from "../../src/core/utils/FrameworkValidation";
import {
  isProductionOptInValid,
  resolveEnvironmentFileName,
  resolveEnvironmentName,
  resolveExecutionProfile,
  shouldExcludeDestructiveProductionTests,
} from "../../src/core/utils/EnvironmentResolver";

test.describe("Environment configuration resolution", () => {
  test("resolves supported names, legacy aliases, and the configured default", () => {
    expect(
      resolveEnvironmentName(undefined, FrameworkConfig.environment.default),
    ).toBe("qa");
    expect(resolveEnvironmentName(" LOCAL ", "qa")).toBe("local");
    expect(resolveEnvironmentName("Staging", "qa")).toBe("staging");
    expect(resolveEnvironmentName("PROD", "qa")).toBe("production");
    expect(resolveEnvironmentName("production", "qa")).toBe("production");
    expect(resolveEnvironmentName("unknown", "qa")).toBeUndefined();
  });

  test("maps normalized environments to compatible env filenames", () => {
    expect(resolveEnvironmentFileName("local")).toBe(".env.local");
    expect(resolveEnvironmentFileName("staging")).toBe(".env.staging");
    expect(resolveEnvironmentFileName("production")).toBe(".env.prod");
    expect(resolveEnvironmentFileName("uat")).toBe(".env.uat");
  });

  test("resolves environment and CI-specific execution settings", () => {
    expect(
      resolveExecutionProfile("local", false, FrameworkConfig),
    ).toMatchObject({
      retries: 0,
      workers: "50%",
      fullyParallel: false,
    });
    expect(resolveExecutionProfile("qa", true, FrameworkConfig)).toMatchObject({
      retries: 2,
      workers: "100%",
    });
    expect(
      resolveExecutionProfile("production", true, FrameworkConfig),
    ).toMatchObject({
      retries: 0,
      workers: 1,
      fullyParallel: false,
    });
  });

  test("reports missing variables and invalid URLs without values", () => {
    const issues = validateFrameworkInputs(
      "qa",
      {
        BASE_URL: "https://user:private-value@example.test",
        API_URL: "not a URL",
        USERNAME: "private-user",
        PASSWORD: "private-password",
        HEADLESS: "true",
      },
      FrameworkConfig,
    );
    const diagnosticText = issues.join(" ");

    expect(diagnosticText).toContain(
      "BASE_URL must be an absolute HTTP or HTTPS URL",
    );
    expect(diagnosticText).toContain(
      "API_URL must be an absolute HTTP or HTTPS URL",
    );
    expect(diagnosticText).not.toContain("private-value");
    expect(diagnosticText).not.toContain("private-user");
    expect(diagnosticText).not.toContain("private-password");

    const missing = validateFrameworkInputs(
      "qa",
      { BASE_URL: "https://app.example.test", HEADLESS: "true" },
      FrameworkConfig,
    );
    expect(missing.join(" ")).toContain("API_URL, USERNAME, PASSWORD");
  });

  test("validates reporter, artifact, timeout, retry, and worker settings", () => {
    const invalidConfig = {
      ...FrameworkConfig,
      timeout: { ...FrameworkConfig.timeout, action: 0 },
      reporter: {
        ...FrameworkConfig.reporter,
        html: "enabled" as unknown as boolean,
      },
      artifacts: {
        ...FrameworkConfig.artifacts,
        screenshot:
          "sometimes" as unknown as FrameworkConfiguration["artifacts"]["screenshot"],
      },
      retry: { ...FrameworkConfig.retry, ci: -1 },
      workers: { ...FrameworkConfig.workers, local: "many" },
    };
    const issues = validateFrameworkInputs(
      "qa",
      validEnvironment(),
      invalidConfig,
    );

    expect(issues).toContain(
      "timeout.action must be a positive finite number.",
    );
    expect(issues).toContain("reporter.html must be a boolean.");
    expect(issues).toContain("artifacts.screenshot has an unsupported value.");
    expect(issues).toContain("retry.ci must be a non-negative integer.");
    expect(issues).toContain(
      "workers.local must be a positive integer or a positive percentage string.",
    );
  });
  test("requires explicit production opt-in and blocks destructive tests by default", () => {
    const environment = validEnvironment();
    expect(
      isProductionOptInValid("production", environment, FrameworkConfig),
    ).toBe(false);
    expect(
      validateFrameworkInputs("production", environment, FrameworkConfig).join(
        " ",
      ),
    ).toContain("Production execution is blocked");
    expect(
      isProductionOptInValid(
        "production",
        { ...environment, ALLOW_PRODUCTION_TESTS: "true" },
        FrameworkConfig,
      ),
    ).toBe(true);
    expect(
      shouldExcludeDestructiveProductionTests(
        "production",
        environment,
        FrameworkConfig,
      ),
    ).toBe(true);
    expect(
      shouldExcludeDestructiveProductionTests(
        "production",
        {
          ...environment,
          ALLOW_PRODUCTION_TESTS: "true",
          ALLOW_PRODUCTION_DESTRUCTIVE_TESTS: "true",
        },
        {
          ...FrameworkConfig,
          environment: {
            ...FrameworkConfig.environment,
            productionSafety: {
              ...FrameworkConfig.environment.productionSafety,
              allowDestructiveTests: true,
            },
          },
        },
      ),
    ).toBe(false);
  });
});

function validEnvironment(): NodeJS.ProcessEnv {
  return {
    BASE_URL: "https://app.example.test",
    API_URL: "https://api.example.test",
    USERNAME: "placeholder-user",
    PASSWORD: "placeholder-password",
    HEADLESS: "true",
  };
}
