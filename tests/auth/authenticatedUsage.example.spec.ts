import { expect } from "@playwright/test";
import { test } from "@fixtures/BaseTest";
import { FrameworkConfig } from "../../configs/FrameworkConfig";

const role = process.env.AUTH_EXAMPLE_ROLE?.trim() ?? "";
const roleIsConfigured =
  FrameworkConfig.authentication.enabled &&
  role.length > 0 &&
  Object.hasOwn(FrameworkConfig.authentication.users, role);

const authorizedApiPath = process.env.AUTH_EXAMPLE_API_PATH?.trim() ?? "";

test.describe("Configured authentication examples", () => {
  test.describe("UI session reuse", () => {
    test.skip(
      !roleIsConfigured,
      "Configure AUTH_EXAMPLE_ROLE and its auth user mapping before running this example.",
    );
    test.use({ authRole: role });

    test("opens a page with the configured authenticated session", async ({
      authenticatedPage,
    }) => {
      await expect(
        authenticatedPage.locator(
          FrameworkConfig.authentication.ui.authenticatedSelector,
        ),
      ).toBeVisible();
    });
  });

  test.describe("Authenticated API session", () => {
    test.skip(
      !roleIsConfigured || authorizedApiPath.length === 0,
      "Configure AUTH_EXAMPLE_ROLE, AUTH_EXAMPLE_API_PATH, and API authentication before running this example.",
    );
    test.use({ authRole: role });

    test("calls an authorized endpoint with the configured role", async ({
      authenticatedApiClient,
    }) => {
      const response = await authenticatedApiClient.get(authorizedApiPath);
      expect(response.ok()).toBe(true);
    });
  });
});
