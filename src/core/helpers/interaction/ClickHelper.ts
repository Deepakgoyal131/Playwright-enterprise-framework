import { Locator } from "@playwright/test";
import { Logger } from "../../logger";
import { WaitHelper } from "./WaitHelper";
import { ErrorHandler, ErrorType } from "../../errors";
import { FrameworkConfig } from "configs/FrameworkConfig";
import { RetryHelper } from "./RetryHelper";
import { Environment } from "configs/Environment";

export class ClickHelper {

    public static async click(
        locator: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        Logger.debug("Starting click action.");

        try {

            await RetryHelper.execute({

                actionName: "ClickHelper.click",

                retries: Environment.retryCount,

                action: async () => {

                    await WaitHelper.waitForVisible(locator, timeout);

                    await WaitHelper.waitForEnabled(locator, timeout);

                    await locator.scrollIntoViewIfNeeded();

                    await locator.click({ timeout });

                }

            });
            Logger.info("Click action completed successfully.");

        } catch (error) {

            ErrorHandler.handle(
                ErrorType.CLICK,
                "ClickHelper.click",
                "Failed to click the element.",
                error
            );

        }

    }

}