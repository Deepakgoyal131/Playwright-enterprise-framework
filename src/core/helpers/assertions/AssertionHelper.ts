import { Locator, Page, expect } from "@playwright/test";
import { FrameworkConfig } from "configs/FrameworkConfig";
import { Logger } from "@core/logger";
import { ErrorHandler, ErrorType } from "@core/errors";

export class AssertionHelper {

    public static async assertVisible(
        locator: Locator,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug("Asserting element is visible.");

        try {

            await expect(locator).toBeVisible({ timeout });

            Logger.info("Assertion passed: Element is visible.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertVisible",
                "Expected element to be visible.",
                error
            );

        }

    }

    public static async assertHidden(
        locator: Locator,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug("Asserting element is hidden.");

        try {

            await expect(locator).toBeHidden({ timeout });

            Logger.info("Assertion passed: Element is hidden.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertHidden",
                "Expected element to be hidden.",
                error
            );

        }

    }

    public static async assertText(
        locator: Locator,
        expected: string,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug(`Asserting text: "${expected}"`);

        try {

            await expect(locator).toHaveText(expected, { timeout });

            Logger.info("Assertion passed: Text matches.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertText",
                `Expected text: "${expected}"`,
                error
            );

        }

    }

    public static async assertContainsText(
        locator: Locator,
        expected: string,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug(`Asserting text contains: "${expected}"`);

        try {

            await expect(locator).toContainText(expected, { timeout });

            Logger.info("Assertion passed: Text contains expected value.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertContainsText",
                `Expected text to contain: "${expected}"`,
                error
            );

        }

    }

    public static async assertValue(
        locator: Locator,
        expected: string,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug(`Asserting value: "${expected}"`);

        try {

            await expect(locator).toHaveValue(expected, { timeout });

            Logger.info("Assertion passed: Value matches.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertValue",
                `Expected value: "${expected}"`,
                error
            );

        }

    }

    public static async assertEnabled(
        locator: Locator,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug("Asserting element is enabled.");

        try {

            await expect(locator).toBeEnabled({ timeout });

            Logger.info("Assertion passed: Element is enabled.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertEnabled",
                "Expected element to be enabled.",
                error
            );

        }

    }

    public static async assertDisabled(
        locator: Locator,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug("Asserting element is disabled.");

        try {

            await expect(locator).toBeDisabled({ timeout });

            Logger.info("Assertion passed: Element is disabled.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertDisabled",
                "Expected element to be disabled.",
                error
            );

        }

    }

    public static async assertChecked(
        locator: Locator,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug("Asserting checkbox is checked.");

        try {

            await expect(locator).toBeChecked({ timeout });

            Logger.info("Assertion passed: Checkbox is checked.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertChecked",
                "Expected checkbox to be checked.",
                error
            );

        }

    }

    public static async assertUnchecked(
        locator: Locator,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug("Asserting checkbox is unchecked.");

        try {

            await expect(locator).not.toBeChecked({ timeout });

            Logger.info("Assertion passed: Checkbox is unchecked.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertUnchecked",
                "Expected checkbox to be unchecked.",
                error
            );

        }

    }

    public static async assertUrl(
        page: Page,
        expected: string,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug(`Asserting URL contains: "${expected}"`);

        try {

            await expect(page).toHaveURL(new RegExp(expected), { timeout });

            Logger.info("Assertion passed: URL matches.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertUrl",
                `Expected URL: "${expected}"`,
                error
            );

        }

    }

    public static async assertTitle(
        page: Page,
        expected: string,
        timeout = FrameworkConfig.timeout.expect
    ): Promise<void> {

        Logger.debug(`Asserting title: "${expected}"`);

        try {

            await expect(page).toHaveTitle(expected, { timeout });

            Logger.info("Assertion passed: Title matches.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.ASSERTION,
                "AssertionHelper.assertTitle",
                `Expected title: "${expected}"`,
                error
            );

        }

    }
}