import { createServer } from "node:http";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { FrameworkConfig } from "../configs/FrameworkConfig";
import {
  GlobalExecutionMetadataStore,
  requiresGlobalCleanup,
  type GlobalExecutionMetadata,
} from "../src/core/utils/GlobalExecutionMetadata";
import {
  cleanupGlobalTestData,
  runGlobalHealthCheck,
  type GlobalTestDataStrategyModule,
} from "../src/core/utils/GlobalLifecycleService";
import { validateFrameworkInputs } from "../src/core/utils/FrameworkValidation";

test.describe("Global lifecycle support", () => {
  test("validates environment, URLs, and values without echoing secrets", () => {
    const env = {
      BASE_URL: "https://app.example.test",
      API_URL: "https://api.example.test",
      USERNAME: "do-not-print-user",
      PASSWORD: "do-not-print-password",
      HEADLESS: "true",
    };

    expect(validateFrameworkInputs("qa", env, FrameworkConfig)).toEqual([]);

    const issues = validateFrameworkInputs(
      "invalid",
      {
        ...env,
        API_URL: "https://user:secret@example.test",
        HEADLESS: "maybe",
      },
      FrameworkConfig,
    );
    const diagnostics = issues.join(" ");

    expect(diagnostics).toContain("FRAMEWORK_ENV");
    expect(diagnostics).toContain("API_URL");
    expect(diagnostics).toContain("HEADLESS");
    expect(diagnostics).not.toContain("do-not-print");
    expect(diagnostics).not.toContain("secret");
  });

  test("validates enabled health checks require a configurable endpoint", () => {
    const config = {
      ...FrameworkConfig,
      globalLifecycle: {
        ...FrameworkConfig.globalLifecycle,
        healthCheck: {
          ...FrameworkConfig.globalLifecycle.healthCheck,
          enabled: true,
          endpoint: "",
        },
      },
    };

    expect(validateFrameworkInputs("qa", validEnvironment(), config)).toContain(
      "A health-check endpoint is required when the global health check is enabled.",
    );

    const unsafeEndpointConfig = {
      ...FrameworkConfig,
      globalLifecycle: {
        ...FrameworkConfig.globalLifecycle,
        healthCheck: {
          ...FrameworkConfig.globalLifecycle.healthCheck,
          endpoint: "//external.example.test/health",
        },
      },
    };
    expect(
      validateFrameworkInputs("qa", validEnvironment(), unsafeEndpointConfig),
    ).toContain(
      "The health-check endpoint must be a root-relative path without a query string.",
    );
  });

  test("runs health checks against a local API and reports status mismatch", async () => {
    const server = createServer((_request, response) => {
      response.statusCode = 204;
      response.end();
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string") {
      await new Promise<void>((resolve) => server.close(() => resolve()));
      throw new Error("Could not bind the local health-check server.");
    }

    const baseUrl = `http://127.0.0.1:${address.port}`;
    try {
      await expect(
        runGlobalHealthCheck(baseUrl, {
          enabled: true,
          base: "api",
          endpoint: "/health",
          timeout: 2000,
          expectedStatus: 204,
        }),
      ).resolves.toBeUndefined();

      await expect(
        runGlobalHealthCheck(baseUrl, {
          enabled: true,
          base: "api",
          endpoint: "/health",
          timeout: 2000,
          expectedStatus: 200,
        }),
      ).rejects.toThrow("Health check returned HTTP 204; expected HTTP 200.");
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  test("persists only execution metadata and explicit cleanup references", () => {
    const directory = fs.mkdtempSync(
      path.join(os.tmpdir(), "playwright-global-"),
    );
    const metadataPath = path.join(directory, "execution.json");
    const metadata: GlobalExecutionMetadata = {
      executionId: randomUUID(),
      environment: "qa",
      startedAt: new Date().toISOString(),
      browser: "chromium",
      status: "running",
      cleanupStatus: "pending",
      resources: [{ type: "temporary-record", id: "record-123" }],
    };

    try {
      GlobalExecutionMetadataStore.write(metadataPath, metadata);
      expect(GlobalExecutionMetadataStore.read(metadataPath)).toEqual(metadata);
      expect(requiresGlobalCleanup(metadata)).toBe(false);
      expect(
        requiresGlobalCleanup({
          ...metadata,
          testDataModulePath: "./strategy.cjs",
        }),
      ).toBe(true);
      expect(
        requiresGlobalCleanup({
          ...metadata,
          cleanupStatus: "failed",
          testDataModulePath: "./strategy.cjs",
        }),
      ).toBe(true);
      expect(
        requiresGlobalCleanup({
          ...metadata,
          cleanupStatus: "completed",
          testDataModulePath: "./strategy.cjs",
        }),
      ).toBe(false);
      const serialized = fs.readFileSync(metadataPath, "utf8");
      expect(serialized).not.toContain("password");
      expect(serialized).not.toContain("token");
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });

  test("passes only setup-returned resource references to cleanup", async () => {
    const cleaned: string[] = [];
    const strategy: GlobalTestDataStrategyModule = {
      async initialize() {
        return [{ type: "temporary-record", id: "setup-owned-1" }];
      },
      async cleanup(_context, resources) {
        cleaned.push(...resources.map((resource) => resource.id));
      },
    };
    const resources = await strategy.initialize({
      environment: "qa",
      executionId: "execution-1",
    });

    await cleanupGlobalTestData(
      strategy,
      { environment: "qa", executionId: "execution-1" },
      resources,
    );

    expect(cleaned).toEqual(["setup-owned-1"]);
  });
});

function validEnvironment(): NodeJS.ProcessEnv {
  return {
    BASE_URL: "https://app.example.test",
    API_URL: "https://api.example.test",
    USERNAME: "test-user",
    PASSWORD: "test-password",
    HEADLESS: "false",
  };
}
