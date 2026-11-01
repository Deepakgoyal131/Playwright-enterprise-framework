import { request, type APIRequestContext } from "@playwright/test";
import * as path from "node:path";
import type { GlobalHealthCheckConfig } from "../../../configs/types/FrameworkConfig.types";
import { ErrorHandler, ErrorType } from "../errors";
import { FrameworkError } from "../errors/FrameworkError";
import { Logger } from "../logger";
import type { GlobalSetupResource } from "./GlobalExecutionMetadata";

export interface GlobalTestDataContext {
  environment: string;
  executionId: string;
}

export interface GlobalTestDataStrategyModule {
  initialize(context: GlobalTestDataContext): Promise<GlobalSetupResource[]>;
  cleanup(
    context: GlobalTestDataContext,
    resources: GlobalSetupResource[],
  ): Promise<void>;
}

export async function runGlobalHealthCheck(
  baseUrl: string,
  config: GlobalHealthCheckConfig,
): Promise<void> {
  if (!config.enabled) {
    return;
  }

  let apiContext: APIRequestContext | undefined;
  try {
    apiContext = await request.newContext({
      baseURL: baseUrl,
      timeout: config.timeout,
    });
    const response = await apiContext.get(config.endpoint);
    if (response.status() !== config.expectedStatus) {
      ErrorHandler.handle(
        ErrorType.API,
        "runGlobalHealthCheck",
        `Health check returned HTTP ${response.status()}; expected HTTP ${config.expectedStatus}.`,
        new Error("Application health check status mismatch."),
      );
    }
    Logger.info("Global application health check passed.");
  } catch (error) {
    if (error instanceof FrameworkError) {
      throw error;
    }
    ErrorHandler.handle(
      ErrorType.API,
      "runGlobalHealthCheck",
      "Application health check request failed. Check the configured endpoint and service availability.",
      error,
    );
  } finally {
    try {
      await apiContext?.dispose();
    } catch {
      Logger.warn("Global health-check request context disposal failed.");
    }
  }
}

export function loadGlobalTestDataStrategy(
  modulePath: string,
): GlobalTestDataStrategyModule {
  const resolvedPath = path.resolve(process.cwd(), modulePath);
  let loadedModule: unknown;
  try {
    loadedModule = require(resolvedPath) as unknown;
  } catch (error) {
    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "loadGlobalTestDataStrategy",
      "Could not load the configured global test-data strategy module.",
      error,
    );
  }

  if (!isGlobalTestDataStrategyModule(loadedModule)) {
    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "loadGlobalTestDataStrategy",
      "The global test-data module must export async initialize(context) and cleanup(context, resources) functions.",
      new Error("Invalid global test-data strategy module."),
    );
  }
  return loadedModule;
}

export async function initializeGlobalTestData(
  strategy: GlobalTestDataStrategyModule,
  context: GlobalTestDataContext,
): Promise<GlobalSetupResource[]> {
  const resources = await strategy.initialize(context);
  if (
    !Array.isArray(resources) ||
    resources.some(
      (resource) =>
        !resource ||
        typeof resource.type !== "string" ||
        resource.type.trim().length === 0 ||
        typeof resource.id !== "string" ||
        resource.id.trim().length === 0,
    )
  ) {
    ErrorHandler.handle(
      ErrorType.FRAMEWORK,
      "initializeGlobalTestData",
      "The test-data strategy must return resource references with non-empty type and id fields.",
      new Error("Invalid global test-data resource references."),
    );
  }
  return resources;
}

export async function cleanupGlobalTestData(
  strategy: GlobalTestDataStrategyModule,
  context: GlobalTestDataContext,
  resources: GlobalSetupResource[],
): Promise<void> {
  if (resources.length === 0) {
    return;
  }
  await strategy.cleanup(context, resources);
}

function isGlobalTestDataStrategyModule(
  value: unknown,
): value is GlobalTestDataStrategyModule {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<GlobalTestDataStrategyModule>;
  return (
    typeof candidate.initialize === "function" &&
    typeof candidate.cleanup === "function"
  );
}
