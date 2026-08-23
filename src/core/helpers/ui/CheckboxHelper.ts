import { Locator } from "@playwright/test";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors";

export class CheckboxHelper {

    private constructor() {}

    /**
     * Check a checkbox.
     */
    public static async check(
        locator: Locator
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.CHECKBOX_CHECK,
            errorType: ErrorType.DROPDOWN,
            successMessage: "Checkbox checked successfully.",
            failureMessage: "Failed to check the checkbox.",
            action: async () => {
                if (!(await locator.isChecked())) {
                    await locator.check();
                }
            }
        });
    }

    /**
     * Uncheck a checkbox.
     */
    public static async uncheck(
        locator: Locator
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.CHECKBOX_UNCHECK,
            errorType: ErrorType.DROPDOWN,
            successMessage: "Checkbox unchecked successfully.",
            failureMessage: "Failed to uncheck the checkbox.",
            action: async () => {
                if (await locator.isChecked()) {
                    await locator.uncheck();
                }
            }
        });
    }

    /**
     * Set checkbox state.
     */
    public static async setChecked(
        locator: Locator,
        checked: boolean
    ): Promise<void> {

        if (checked) {
            await this.check(locator);
        } else {
            await this.uncheck(locator);
        }
    }

    /**
     * Get checkbox state.
     */
    public static async isChecked(
        locator: Locator
    ): Promise<boolean> {

        return await ActionExecutor.execute({
            actionName: ActionNames.CHECKBOX_IS_CHECKED,
            errorType: ErrorType.DROPDOWN,
            successMessage: "Checkbox state retrieved successfully.",
            failureMessage: "Failed to determine checkbox state.",
            action: async () => {
                return await locator.isChecked();
            }
        }).then(result => result.data ?? false);
    }

    /**
     * Toggle checkbox.
     */
    public static async toggle(
        locator: Locator
    ): Promise<void> {

        const checked = await this.isChecked(locator);
        await this.setChecked(locator, !checked);
    }
}