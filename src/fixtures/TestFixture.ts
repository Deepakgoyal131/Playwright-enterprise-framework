import {
  test as base,
  expect as baseExpect,
  request as playwrightRequest,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import { FrameworkConfig } from "../../configs/FrameworkConfig";
import { Environment } from "../../configs/Environment";
import { APIClient } from "../api/APIClient";
import { AllureHelper } from "../core/helpers/reporting/AllureHelper";
import { Logger } from "../core/logger";
import { ErrorHandler, ErrorType } from "../core/errors";
import {
  APIAuthStrategy,
  AuthenticationManager,
  resolveAuthUser,
  UIAuthStrategy,
} from "../auth";
import type { AuthSession, AuthStrategy } from "../auth/types/Auth.types";
import { SessionManager } from "../auth/SessionManager";
import {
  createTestExecutionDetails,
  TestExecutionDiagnostics,
} from "../core/utils/TestExecutionDiagnostics";

export interface TestFixtures {
  apiClient: APIClient;
  authSession: AuthSession;
  authenticatedContext: BrowserContext;
  authenticatedPage: Page;
  authenticatedApiClient: APIClient;
  testExecutionId: string;
  testDiagnostics: void;
}

export interface AuthFixtureOptions {
  authRole: string;
  authStrategy: AuthStrategy | undefined;
}

export const test = base.extend<TestFixtures & AuthFixtureOptions>({
  authRole: ["", { option: true }],
  authStrategy: [undefined, { option: true }],

  testExecutionId: async ({}, use, testInfo) => {
    await use(createTestExecutionDetails(testInfo).executionId);
  },

  testDiagnostics: [
    async ({}, use, testInfo) => {
      const details = createTestExecutionDetails(testInfo);
      TestExecutionDiagnostics.started(details);
      try {
        await use();
      } finally {
        TestExecutionDiagnostics.finished(
          details,
          testInfo.status ?? "unknown",
        );
      }
    },
    { auto: true },
  ],

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

  authSession: async ({ browser, authRole, authStrategy }, use, testInfo) => {
    if (!authRole) {
      ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "TestFixture.authSession",
        "Set the authRole fixture option to request an authenticated session.",
        new Error("Authentication role was not selected."),
      );
    }

    const config = {
      ...FrameworkConfig.authentication,
      sessionDirectory: SessionManager.workerDirectory(
        FrameworkConfig.authentication.sessionDirectory,
        testInfo.workerIndex,
      ),
    };
    const user = resolveAuthUser(authRole, config);
    const strategies: Partial<Record<"ui" | "api" | "custom", AuthStrategy>> = {
      ui: new UIAuthStrategy(
        config.ui,
        Environment.baseURL,
        FrameworkConfig.timeout.navigation,
      ),
      api: new APIAuthStrategy(
        config.api,
        Environment.apiURL,
        FrameworkConfig.timeout.action,
        config.sessionLifetimeSeconds,
      ),
      custom: authStrategy,
    };
    const manager = new AuthenticationManager(config, strategies);
    const session = await manager.getSession(user, browser);

    try {
      await use(session);
    } finally {
      await session.context.close().catch(() => undefined);
    }
  },

  authenticatedContext: async ({ authSession }, use) => {
    await use(authSession.context);
  },

  authenticatedPage: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    try {
      await use(page);
    } finally {
      await page.close().catch(() => undefined);
    }
  },

  authenticatedApiClient: async ({ authSession }, use) => {
    const requestContext = await playwrightRequest.newContext({
      baseURL: Environment.apiURL,
      timeout: FrameworkConfig.timeout.action,
      storageState: authSession.storageState,
      extraHTTPHeaders: authSession.headers,
    });
    try {
      await use(new APIClient(requestContext));
    } finally {
      await requestContext.dispose();
    }
  },
});

export const expect = baseExpect;
