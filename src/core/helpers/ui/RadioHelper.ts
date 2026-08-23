import { Locator } from "@playwright/test";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors";

export class RadioHelper {

    private constructor() {}

    /**
     * Select radio button.
     */
    public static async select(
        locator: Locator
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.RADIO_SELECT,
            errorType: ErrorType.DROPDOWN,
            successMessage: "Radio button selected successfully.",
            failureMessage: "Failed to select the radio button.",
            action: async () => {
                if (!(await locator.isChecked())) {
                    await locator.check();
                }
            }
        });
    }

    /**
     * Check whether radio is selected.
     */
    public static async isSelected(
        locator: Locator
    ): Promise<boolean> {

        return await ActionExecutor.execute({
            actionName: ActionNames.RADIO_IS_SELECTED,
            errorType: ErrorType.DROPDOWN,
            successMessage: "Radio button state retrieved successfully.",
            failureMessage: "Failed to determine radio button state.",
            action: async () => {
                return await locator.isChecked();
            }
        }).then(result => result.data ?? false);
    }
}