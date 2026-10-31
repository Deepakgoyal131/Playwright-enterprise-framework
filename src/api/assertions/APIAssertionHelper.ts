import { expect, type APIResponse } from "@playwright/test";
import { Logger } from "../../core/logger";

export class APIAssertionHelper {
  public static async assertStatus(
    response: APIResponse,
    expectedStatus: number,
  ): Promise<void> {
    Logger.debug(`Asserting API response status is ${expectedStatus}.`);
    await expect(response.status()).toBe(expectedStatus);
  }

  public static async assertStatusInRange(
    response: APIResponse,
    minimumStatus: number,
    maximumStatus: number,
  ): Promise<void> {
    Logger.debug(
      `Asserting API response status is between ${minimumStatus} and ${maximumStatus}.`,
    );
    await expect(response.status()).toBeGreaterThanOrEqual(minimumStatus);
    await expect(response.status()).toBeLessThanOrEqual(maximumStatus);
  }

  public static async assertOK(response: APIResponse): Promise<void> {
    Logger.debug("Asserting API response is successful.");
    await expect(response).toBeOK();
  }

  public static async assertHeader(
    response: APIResponse,
    headerName: string,
    expectedValue: string,
  ): Promise<void> {
    Logger.debug(`Asserting API response includes header ${headerName}.`);
    const headerValue = response.headers()[headerName.toLowerCase()];
    await expect(headerValue).toBe(expectedValue);
  }

  public static async assertJson(
    response: APIResponse,
    expectedBody: unknown,
  ): Promise<void> {
    Logger.debug("Asserting API response JSON matches the expected body.");
    await expect(await response.json()).toEqual(expectedBody);
  }

  public static async assertJsonContains(
    response: APIResponse,
    expectedProperties: Record<string, unknown>,
  ): Promise<void> {
    Logger.debug(
      "Asserting API response JSON contains the expected properties.",
    );
    await expect(await response.json()).toMatchObject(expectedProperties);
  }
}
