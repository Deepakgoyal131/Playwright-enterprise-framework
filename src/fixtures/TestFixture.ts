import {
  test as base,
  expect as baseExpect,
  request as playwrightRequest,
} from "@playwright/test";
import { FrameworkConfig } from "../../configs/FrameworkConfig";
import { Environment } from "../../configs/Environment";
import { APIClient } from "../api/APIClient";
import { AllureHelper } from "../core/helpers/reporting/AllureHelper";
import { Logger } from "../core/logger";

export interface TestFixtures {
  apiClient: APIClient;
}

export const test = base.extend<TestFixtures>({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    const failed = testInfo.status !== testInfo.expectedStatus;
    if (
      !failed ||
      !AllureHelper.isEnabled() ||
      !FrameworkConfig.allure.attachScreenshots ||
      !FrameworkConfig.screenshot.enabled ||
      !FrameworkConfig.screenshot.captureOnFailure
    ) {
      return;
    }

    try {
      const screenshot = await page.screenshot({
        fullPage: FrameworkConfig.screenshot.fullPage,
        animations: "disabled",
      });
      await testInfo.attach("Failure screenshot", {
        body: screenshot,
        contentType: "image/png",
      });
    } catch {
      Logger.warn("Failed to capture and attach the failure screenshot.");
    }
  },

  apiClient: async ({}, use) => {
    const requestContext = await playwrightRequest.newContext({
      baseURL: Environment.apiURL,
      timeout: FrameworkConfig.timeout.action,
    });

    try {
      await use(new APIClient(requestContext));
    } finally {
      await requestContext.dispose();
    }
  },
});

export const expect = baseExpect;
