import * as path from "node:path";
import type { FullResult } from "@playwright/test/reporter";
import { FrameworkConfig } from "../../../configs/FrameworkConfig";
import { GlobalExecutionMetadataStore } from "./GlobalExecutionMetadata";

export default class GlobalExecutionMetadataReporter {
  public onEnd(result: FullResult): void {
    const metadataPath = path.resolve(
      process.cwd(),
      FrameworkConfig.globalLifecycle.metadataPath,
    );
    const metadata = GlobalExecutionMetadataStore.read(metadataPath);

    if (!metadata || metadata.status === "setup-failed") {
      return;
    }

    metadata.status = result.status;
    metadata.endedAt = new Date().toISOString();
    GlobalExecutionMetadataStore.write(metadataPath, metadata);
  }
}
