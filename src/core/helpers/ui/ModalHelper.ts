import { Locator } from "@playwright/test";

import { WaitHelper, ClickHelper } from "@core/helpers/interaction";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors";
import { FrameworkConfig } from "configs/FrameworkConfig";

export interface ModalOptions {

    container: Locator;

    confirmButton?: Locator;

    cancelButton?: Locator;

    message?: Locator;
}

export class ModalHelper {

    private constructor() {}

    /**
     * Wait for modal to become visible.
     */
    public static async waitForVisible(
        modal: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.MODAL_VISIBLE,
            errorType: ErrorType.WAIT,
            successMessage: "Modal became visible.",
            failureMessage: "Modal did not become visible.",
            action: async () => {
                await WaitHelper.waitForVisible(modal, timeout);
            }
        });
    }

    /**
     * Wait for modal to disappear.
     */
    public static async waitForHidden(
        modal: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.MODAL_HIDDEN,
            errorType: ErrorType.WAIT,
            successMessage: "Modal disappeared.",
            failureMessage: "Modal did not disappear.",
            action: async () => {
                await modal.waitFor({ state: "hidden", timeout });
            }
        });
    }

    /**
     * Click confirm button.
     */
    public static async confirm(
        button: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.MODAL_CONFIRM,
            errorType: ErrorType.CLICK,
            successMessage: "Modal confirmed successfully.",
            failureMessage: "Failed to confirm modal.",
            action: async () => {
                await ClickHelper.click(button, timeout);
            }
        });
    }

    /**
     * Click cancel button.
     */
    public static async cancel(
        button: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.MODAL_CANCEL,
            errorType: ErrorType.CLICK,
            successMessage: "Modal cancelled successfully.",
            failureMessage: "Failed to cancel modal.",
            action: async () => {
                await ClickHelper.click(button, timeout);
            }
        });
    }

    /**
     * Get modal message.
     */
    public static async getMessage(
        messageLocator: Locator
    ): Promise<string> {

        return await ActionExecutor.execute({
            actionName: ActionNames.MODAL_MESSAGE,
            errorType: ErrorType.ASSERTION,
            successMessage: "Modal message retrieved successfully.",
            failureMessage: "Failed to read the modal message.",
            action: async () => {
                return (await messageLocator.innerText()).trim();
            }
        }).then(result => result.data ?? "");
    }

    /**
     * Check whether modal is visible.
     */
    public static async isVisible(
        modal: Locator
    ): Promise<boolean> {

        return await ActionExecutor.execute({
            actionName: ActionNames.MODAL_IS_VISIBLE,
            errorType: ErrorType.WAIT,
            successMessage: "Modal visibility checked successfully.",
            failureMessage: "Failed to check modal visibility.",
            action: async () => {
                return await modal.isVisible();
            }
        }).then(result => result.data ?? false);
    }
}