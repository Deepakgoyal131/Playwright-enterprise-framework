import { Page } from "@playwright/test";

import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors";

export class NavigationHelper {

    private constructor() {}

    /**
     * Navigate to URL.
     */
    public static async goto(
        page: Page,
        url: string
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.NAVIGATION_GOTO,
            errorType: ErrorType.FRAMEWORK,
            successMessage: `Navigated to ${url}`,
            failureMessage: `Failed to navigate to ${url}`,
            action: async () => {
                await page.goto(url);
            }
        });
    }

    /**
     * Reload page.
     */
    public static async reload(
        page: Page
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.NAVIGATION_RELOAD,
            errorType: ErrorType.FRAMEWORK,
            successMessage: "Page reloaded successfully.",
            failureMessage: "Failed to reload the page.",
            action: async () => {
                await page.reload();
            }
        });
    }

    /**
     * Go back.
     */
    public static async goBack(
        page: Page
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.NAVIGATION_BACK,
            errorType: ErrorType.FRAMEWORK,
            successMessage: "Navigation went back successfully.",
            failureMessage: "Failed to go back.",
            action: async () => {
                await page.goBack();
            }
        });
    }

    /**
     * Go forward.
     */
    public static async goForward(
        page: Page
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.NAVIGATION_FORWARD,
            errorType: ErrorType.FRAMEWORK,
            successMessage: "Navigation went forward successfully.",
            failureMessage: "Failed to go forward.",
            action: async () => {
                await page.goForward();
            }
        });
    }

    /**
     * Wait for URL.
     */
    public static async waitForUrl(
        page: Page,
        url: string | RegExp
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.NAVIGATION_WAIT_FOR_URL,
            errorType: ErrorType.FRAMEWORK,
            successMessage: `URL matched ${String(url)}.`,
            failureMessage: `Failed waiting for URL ${String(url)}.`,
            action: async () => {
                await page.waitForURL(url);
            }
        });
    }

    /**
     * Get current URL.
     */
    public static getCurrentUrl(
        page: Page
    ): string {

        return page.url();
    }
}