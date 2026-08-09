import { Locator, expect } from "@playwright/test";
import { FrameworkConfig } from "configs/FrameworkConfig";
import { Logger } from "../../logger";
import { WaitHelper } from "./WaitHelper";
import { ErrorHandler, ErrorType } from "../../errors";
import { Environment } from "configs/Environment";
import { RetryHelper } from "./RetryHelper";

export class FillHelper {

    public static async fill(
        locator: Locator,
        value: string,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        Logger.debug(`Filling value: "${value}"`);

        try {

            await RetryHelper.execute({

                actionName: "FillHelper.fill",

                retries: Environment.retryCount,

                action: async () => {

                    await WaitHelper.waitForVisible(locator, timeout);

                    await WaitHelper.waitForEnabled(locator, timeout);

                    await locator.scrollIntoViewIfNeeded();

                    await locator.clear();

                    await locator.fill(value, { timeout });

                    await expect(locator).toHaveValue(value);

                }

            });

            Logger.info("Value entered successfully.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.FILL,
                "FillHelper.fill",
                `Failed to enter value "${value}".`,
                error
            );

        }

    }

}