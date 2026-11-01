import { randomUUID } from "node:crypto";
import * as path from "node:path";
import type { FullConfig } from "@playwright/test";
import { Environment } from "./configs/Environment";
import { FrameworkConfig } from "./configs/FrameworkConfig";
import { ErrorHandler, ErrorType } from "./src/core/errors";
import { Logger } from "./src/core/logger";
import {
  GlobalExecutionMetadataStore,
  type GlobalExecutionMetadata,
  type GlobalSetupResource,
} from "./src/core/utils/GlobalExecutionMetadata";
import {
  cleanupGlobalTestData,
  initializeGlobalTestData,
  loadGlobalTestDataStrategy,
  runGlobalHealthCheck,
  type GlobalTestDataContext,
  type GlobalTestDataStrategyModule,
} from "./src/core/utils/GlobalLifecycleService";

export default async function globalSetup(_config: FullConfig): Promise<void> {
  Environment.initialize();
  const lifecycleConfig = FrameworkConfig.globalLifecycle;
  const metadataPath = path.resolve(
    process.cwd(),
    lifecycleConfig.metadataPath,
  );
  const executionId = randomUUID();
  const context: GlobalTestDataContext = {
    environment: Environment.frameworkEnvironment,
    executionId,
  };
  let strategy: GlobalTestDataStrategyModule | undefined;
  let resources: GlobalSetupResource[] = [];
  const metadata: GlobalExecutionMetadata = {
    executionId,
    environment: context.environment,
    startedAt: new Date().toISOString(),
    browser: FrameworkConfig.browser.browserName,
    status: "running",
    cleanupStatus: "not-required",
    resources,
  };

  try {
    GlobalExecutionMetadataStore.write(metadataPath, metadata);
    Logger.info(
      `Global setup started for ${metadata.environment} (${executionId}).`,
    );

    const healthBase =
      lifecycleConfig.healthCheck.base === "app"
        ? Environment.baseURL
        : Environment.apiURL;
    await runGlobalHealthCheck(healthBase, lifecycleConfig.healthCheck);

    if (lifecycleConfig.testData.strategy === "module") {
      const modulePath = path.resolve(
        process.cwd(),
        lifecycleConfig.testData.modulePath,
      );
      strategy = loadGlobalTestDataStrategy(modulePath);
      metadata.testDataModulePath = modulePath;
      resources = await initializeGlobalTestData(strategy, context);
      metadata.resources = resources;
      metadata.cleanupStatus =
        resources.length > 0 ? "pending" : "not-required";
      GlobalExecutionMetadataStore.write(metadataPath, metadata);
    }

    Logger.info("Global setup completed.");
  } catch (error) {
    metadata.status = "setup-failed";
    metadata.endedAt = new Date().toISOString();
    metadata.resources = resources;
    metadata.cleanupStatus = resources.length > 0 ? "pending" : "not-required";
    try {
      GlobalExecutionMetadataStore.write(metadataPath, metadata);
    } catch {
      Logger.error("Could not persist global setup failure metadata.");
    }

    if (strategy && resources.length > 0) {
      try {
        await cleanupGlobalTestData(strategy, context, resources);
        metadata.cleanupStatus = "completed";
      } catch (cleanupError) {
        metadata.cleanupStatus = "failed";
        Logger.error("Global setup rollback cleanup failed.");
        ErrorHandler.handle(
          ErrorType.FRAMEWORK,
          "globalSetup.rollback",
          "Global setup failed and cleanup of setup-created resources also failed.",
          cleanupError,
        );
      } finally {
        try {
          GlobalExecutionMetadataStore.write(metadataPath, metadata);
        } catch {
          Logger.error("Could not persist global setup rollback status.");
        }
      }
    }

    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "globalSetup",
      "Global setup failed. Review the preceding safe diagnostic messages and configured lifecycle options.",
      error,
    );
  }
}
