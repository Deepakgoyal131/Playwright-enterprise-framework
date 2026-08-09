import { Locator, Page, expect } from "@playwright/test";
import { Logger } from "../../logger";
import { ErrorHandler, ErrorType } from "@core/errors";
import { FrameworkConfig } from "configs/FrameworkConfig";
export class WaitHelper {
    private static readonly DEFAULT_TIMEOUT = FrameworkConfig.timeout.expect;

    public static async waitForVisible(
        locator: Locator,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug("Waiting for element to become visible.");

        try {
            await expect(locator).toBeVisible({ timeout });

            Logger.info("Element became visible.");
        } catch (error) {
            ErrorHandler.handle(
                ErrorType.WAIT,
                "WaitHelper.waitForVisible",
                "Element did not become visible.",
                error
            );
        }
    }

    public static async waitForHidden(
        locator: Locator,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug("Waiting for element to become hidden.");

        try {
            await expect(locator).toBeHidden({
                timeout
            });

            Logger.info("Element is hidden.");
        }
        catch (error) {
            ErrorHandler.handle(
                ErrorType.WAIT,
                "WaitHelper.waitForHidden",
                "Element did not hidden",
                error
            );
        }

    }

    public static async waitForEnabled(
        locator: Locator,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug("Waiting for element to become enabled.");

        try {
            await expect(locator).toBeEnabled({
                timeout
            });

            Logger.info("Element is enabled.");
        } catch (error) {
            ErrorHandler.handle(
                ErrorType.WAIT,
                "WaitHelper.waitForEnabled",
                "Element did not become enabled",
                error
            );
        }

    }

    public static async waitForURL(
        page: Page,
        url: string | RegExp,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug(`Waiting for URL: ${url}`);

        try {
            await page.waitForURL(url, {
                timeout
            });

            Logger.info("Navigation completed.");
        } catch (error) {
            ErrorHandler.handle(
                ErrorType.WAIT,
                "WaitHelper.waitForURL",
                `URL: ${url} Not appear`,
                error
            );
        }

    }

    public static async waitForLoad(
        page: Page,
        state: "load" | "domcontentloaded" | "networkidle" = "networkidle"
    ): Promise<void> {

        Logger.debug(`Waiting for page load state: ${state}`);

        try {
            await page.waitForLoadState(state);

            Logger.info("Page fully loaded.");
        } catch (error) {
            ErrorHandler.handle(
                ErrorType.WAIT,
                "WaitHelper.waitForLoad",
                "Page not Loaded",
                error
            );
        }

    }

    public static async waitForText(
        locator: Locator,
        text: string,
        timeout = this.DEFAULT_TIMEOUT
    ): Promise<void> {

        Logger.debug(`Waiting for text: ${text}`);

        try {
            await expect(locator).toContainText(text, {
                timeout
            });

            Logger.info("Expected text appeared.");
        } catch (error) {
            ErrorHandler.handle(
                ErrorType.WAIT,
                "WaitHelper.waitForText",
                `Locator does not contain Text: ${text}`,
                error
            );
        }

    }

}