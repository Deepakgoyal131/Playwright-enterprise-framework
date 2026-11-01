import * as fs from "node:fs";
import * as path from "node:path";

export type GlobalExecutionStatus =
  "running" | "setup-failed" | "passed" | "failed" | "timedout" | "interrupted";

export type GlobalCleanupStatus =
  "not-required" | "pending" | "completed" | "failed";

export interface GlobalSetupResource {
  type: string;
  id: string;
}

export interface GlobalExecutionMetadata {
  executionId: string;
  environment: string;
  startedAt: string;
  endedAt?: string;
  browser: string;
  status: GlobalExecutionStatus;
  cleanupStatus: GlobalCleanupStatus;
  testDataModulePath?: string;
  resources: GlobalSetupResource[];
}

export function requiresGlobalCleanup(
  metadata: GlobalExecutionMetadata,
): boolean {
  return (
    (metadata.cleanupStatus === "pending" ||
      metadata.cleanupStatus === "failed") &&
    metadata.resources.length > 0 &&
    typeof metadata.testDataModulePath === "string" &&
    metadata.testDataModulePath.length > 0
  );
}

export class GlobalExecutionMetadataStore {
  public static read(filePath: string): GlobalExecutionMetadata | undefined {
    try {
      const content: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return this.isMetadata(content) ? content : undefined;
    } catch {
      return undefined;
    }
  }

  public static write(
    filePath: string,
    metadata: GlobalExecutionMetadata,
  ): void {
    const resolvedPath = path.resolve(filePath);
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    const temporaryPath = `${resolvedPath}.${metadata.executionId}.tmp`;
    fs.writeFileSync(temporaryPath, JSON.stringify(metadata, null, 2), {
      encoding: "utf8",
      mode: 0o600,
    });
    fs.renameSync(temporaryPath, resolvedPath);
  }

  private static isMetadata(value: unknown): value is GlobalExecutionMetadata {
    if (!value || typeof value !== "object") {
      return false;
    }

    const candidate = value as Partial<GlobalExecutionMetadata>;
    return (
      typeof candidate.executionId === "string" &&
      typeof candidate.environment === "string" &&
      typeof candidate.startedAt === "string" &&
      typeof candidate.browser === "string" &&
      typeof candidate.status === "string" &&
      typeof candidate.cleanupStatus === "string" &&
      Array.isArray(candidate.resources) &&
      candidate.resources.every(
        (resource) =>
          !!resource &&
          typeof resource.type === "string" &&
          typeof resource.id === "string",
      )
    );
  }
}
