import * as path from "node:path";
import type { FullConfig } from "@playwright/test";
import { FrameworkConfig } from "./configs/FrameworkConfig";
import { ErrorHandler, ErrorType } from "./src/core/errors";
import { Logger } from "./src/core/logger";
import {
  GlobalExecutionMetadataStore,
  requiresGlobalCleanup,
} from "./src/core/utils/GlobalExecutionMetadata";
import {
  cleanupGlobalTestData,
  loadGlobalTestDataStrategy,
  type GlobalTestDataContext,
} from "./src/core/utils/GlobalLifecycleService";

export default async function globalTeardown(
  _config: FullConfig,
): Promise<void> {
  const metadataPath = path.resolve(
    process.cwd(),
    FrameworkConfig.globalLifecycle.metadataPath,
  );
  const metadata = GlobalExecutionMetadataStore.read(metadataPath);

  if (!metadata) {
    Logger.info(
      "Global teardown found no execution metadata; nothing to clean up.",
    );
    return;
  }

  const modulePath = metadata.testDataModulePath;
  if (!requiresGlobalCleanup(metadata) || !modulePath) {
    Logger.info("Global teardown has no pending setup-created resources.");
    return;
  }

  const context: GlobalTestDataContext = {
    environment: metadata.environment,
    executionId: metadata.executionId,
  };

  try {
    const strategy = loadGlobalTestDataStrategy(modulePath);
    await cleanupGlobalTestData(strategy, context, metadata.resources);
    metadata.cleanupStatus = "completed";
    GlobalExecutionMetadataStore.write(metadataPath, metadata);
    Logger.info(
      `Global teardown cleaned ${metadata.resources.length} setup-created resource(s).`,
    );
  } catch (error) {
    metadata.cleanupStatus = "failed";
    try {
      GlobalExecutionMetadataStore.write(metadataPath, metadata);
    } catch {
      Logger.error("Could not persist global cleanup failure status.");
    }
    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "globalTeardown",
      "Cleanup of resources created by global setup failed.",
      error,
    );
  }
}
