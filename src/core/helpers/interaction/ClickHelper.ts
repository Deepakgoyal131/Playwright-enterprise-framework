import { Locator } from "@playwright/test";
import { WaitHelper } from "./WaitHelper";
import { ErrorType } from "../../errors";
import { FrameworkConfig } from "configs/FrameworkConfig";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/constants";

export class ClickHelper {

    public static async click(
    locator: Locator,
    timeout = FrameworkConfig.timeout.action
): Promise<void> {

    await ActionExecutor.execute({

        actionName: ActionNames.CLICK,

        errorType: ErrorType.CLICK,

        successMessage: "Element clicked successfully.",

        failureMessage: "Failed to click element.",

        action: async () => {

            await WaitHelper.waitForVisible(locator, timeout);

            await WaitHelper.waitForEnabled(locator, timeout);

            await locator.scrollIntoViewIfNeeded();

            await locator.click({
                timeout
            });

        }

    });

}

}