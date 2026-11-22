import * as path from "node:path";
import type { TestInfo } from "@playwright/test";
import { FrameworkConfig } from "../../../configs/FrameworkConfig";
import { Environment } from "../../../configs/Environment";
import { Logger } from "../logger";
import { GlobalExecutionMetadataStore } from "./GlobalExecutionMetadata";

export interface TestExecutionDetails {
  executionId: string;
  environment: string;
  workerIndex: number;
  parallelIndex: number;
  testId: string;
  retry: number;
}

export function createTestExecutionDetails(
  testInfo: TestInfo,
): TestExecutionDetails {
  const metadataPath = path.resolve(
    process.cwd(),
    FrameworkConfig.globalLifecycle.metadataPath,
  );
  const metadata = GlobalExecutionMetadataStore.read(metadataPath);
  const runId =
    metadata?.executionId ?? process.env.PLAYWRIGHT_RUN_ID ?? "run-unavailable";

  return {
    executionId: `${runId}-${testInfo.testId}-retry-${testInfo.retry}`,
    environment: Environment.frameworkEnvironment,
    workerIndex: testInfo.workerIndex,
    parallelIndex: testInfo.parallelIndex,
    testId: testInfo.testId,
    retry: testInfo.retry,
  };
}

export class TestExecutionDiagnostics {
  public static started(details: TestExecutionDetails): void {
    Logger.info(this.format("TEST START", details));
  }

  public static finished(details: TestExecutionDetails, status: string): void {
    Logger.info(`${this.format("TEST END", details)} status=${status}`);
  }

  private static format(event: string, details: TestExecutionDetails): string {
    return `[${event}] execution=${details.executionId} environment=${details.environment} worker=${details.workerIndex} parallel=${details.parallelIndex} testId=${details.testId} retry=${details.retry}`;
  }
}
