import { Locator, expect } from "@playwright/test";
import { FrameworkConfig } from "configs/FrameworkConfig";
import { Logger } from "../../logger";
import { WaitHelper } from "./WaitHelper";
import { ErrorHandler, ErrorType } from "../../errors";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/constants";

export class FillHelper {

    public static async fill(
        locator: Locator,
        value: string,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

            await ActionExecutor.execute({

                actionName: ActionNames.FILL,

                errorType: ErrorType.FILL,

                successMessage: "Value entered successfully.",

                failureMessage: "Unable to enter value.",

                action: async () => {

                    await WaitHelper.waitForVisible(locator, timeout);

                    await WaitHelper.waitForEnabled(locator, timeout);

                    await locator.scrollIntoViewIfNeeded();

                    await locator.clear();

                    await locator.fill(value, { timeout });

                    await expect(locator).toHaveValue(value);

                }

            });

    }

}