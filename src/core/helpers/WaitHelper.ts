import { Locator, Page, expect } from "@playwright/test";
import { Logger } from "../logger";
import { FrameworkConfig } from "configs/FrameworkConfig";
export class WaitHelper {
    private static readonly DEFAULT_TIMEOUT = FrameworkConfig.timeout.expect;

    public static async waitForVisible(
        locator: Locator,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug("Waiting for element to become visible.");

        await expect(locator).toBeVisible({
            timeout
        });

        Logger.debug("Element is visible.");
    }

    public static async waitForHidden(
        locator: Locator,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug("Waiting for element to become hidden.");

        await expect(locator).toBeHidden({
            timeout
        });

        Logger.debug("Element is hidden.");
    }

    public static async waitForEnabled(
        locator: Locator,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug("Waiting for element to become enabled.");

        await expect(locator).toBeEnabled({
            timeout
        });

        Logger.debug("Element is enabled.");
    }

    public static async waitForURL(
        page: Page,
        url: string | RegExp,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug(`Waiting for URL: ${url}`);

        await page.waitForURL(url, {
            timeout
        });

        Logger.debug("Navigation completed.");
    }

    public static async waitForLoad(
        page: Page,
        state: "load" | "domcontentloaded" | "networkidle" = "networkidle"
    ): Promise<void> {

        Logger.debug(`Waiting for page load state: ${state}`);

        await page.waitForLoadState(state);

        Logger.debug("Page fully loaded.");
    }

    public static async waitForText(
        locator: Locator,
        text: string,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug(`Waiting for text: ${text}`);

        await expect(locator).toContainText(text, {
            timeout
        });

        Logger.debug("Expected text appeared.");
    }

}