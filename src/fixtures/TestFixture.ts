import {
  test as base,
  expect as baseExpect,
  request as playwrightRequest,
} from "@playwright/test";
import { FrameworkConfig } from "../../configs/FrameworkConfig";
import { Environment } from "../../configs/Environment";
import { APIClient } from "../api/APIClient";

export interface TestFixtures {
  apiClient: APIClient;
}

export const test = base.extend<TestFixtures>({
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
