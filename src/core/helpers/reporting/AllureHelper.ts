import * as allure from "allure-js-commons";
import { FrameworkConfig } from "../../../../configs/FrameworkConfig";

export interface AllureTestMetadata {
  severity?: "blocker" | "critical" | "normal" | "minor" | "trivial";
  feature?: string;
  story?: string;
  owner?: string;
  epic?: string;
}

export class AllureHelper {
  public static isEnabled(): boolean {
    return FrameworkConfig.allure.enabled && FrameworkConfig.reporter.allure;
  }

  public static async step<T>(
    name: string,
    action: () => T | Promise<T>,
  ): Promise<T> {
    if (!this.isEnabled()) {
      return action();
    }

    return allure.step(name, action);
  }

  public static async addMetadata(metadata: AllureTestMetadata): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    if (metadata.severity) await allure.severity(metadata.severity);
    if (metadata.epic) await allure.epic(metadata.epic);
    if (metadata.feature) await allure.feature(metadata.feature);
    if (metadata.story) await allure.story(metadata.story);
    if (metadata.owner) await allure.owner(metadata.owner);
  }

  public static async attachJson(
    name: string,
    content: unknown,
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    try {
      await allure.attachment(name, JSON.stringify(content, null, 2), {
        contentType: allure.ContentType.JSON,
      });
    } catch {
      // Reporting must not mask a test or request failure.
    }
  }
}
