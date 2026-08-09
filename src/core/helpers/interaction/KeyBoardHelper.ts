import { Page } from "@playwright/test";
import { Logger } from "../../logger";
import { ErrorHandler, ErrorType } from "../../errors";
import { RetryHelper } from "./RetryHelper";
import { Environment } from "configs/Environment";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";

export class KeyboardHelper {

    public static async press(
        page: Page,
        key: string
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.KEYBOARD_PRESS,

            errorType: ErrorType.KEYBOARD,

            successMessage: "Key pressed.",

            failureMessage: "Keyboard action failed.",

            action: async () => {

                await page.keyboard.press(key);

            }

        });

    }

    public static async pressCombination(
        page: Page,
        keys: string[]
    ): Promise<void> {

        const combination = keys.join("+");

        await ActionExecutor.execute({

            actionName: ActionNames.KEYBOARD_COMBINATION,
            errorType: ErrorType.KEYBOARD,

            retries: Environment.retryCount,
            successMessage: `${combination} pressed successfully.`,

            failureMessage: `Failed to press ${combination}.`,

            action: async () => {

                await page.keyboard.press(combination);

            }

        });
    }

    public static async type(
        page: Page,
        text: string
    ): Promise<void> {

        Logger.debug(`Typing: ${text}`);


        await ActionExecutor.execute({

            actionName: ActionNames.KEYBOARD_TYPE,
            errorType: ErrorType.KEYBOARD,
            successMessage: "Typing completed.",
            failureMessage: "Typing failed.",
            retries: Environment.retryCount,

            action: async () => {

                await page.keyboard.type(text);

            }

        });
    }

    public static async typeSlowly(
        page: Page,
        text: string,
        delay = 100
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.KEYBOARD_SLOW_TYPE,
            errorType: ErrorType.KEYBOARD,
            retries: Environment.retryCount,
            successMessage: "Slow typing completed.",
            failureMessage: "Slow typing failed.",
            action: async () => {

                await page.keyboard.type(text, {
                    delay
                });

            }

        });
    }
}