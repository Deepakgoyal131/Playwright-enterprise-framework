import { Locator, Page } from "@playwright/test";

import { WaitHelper } from "./WaitHelper";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors/ErrorType";
import { FrameworkConfig } from "configs/FrameworkConfig";

export class MouseHelper {

    public static async hover(
        locator: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_HOVER,

            errorType: ErrorType.MOUSE,

            successMessage: "Hovered over element.",

            failureMessage: "Failed to hover over element.",

            action: async () => {

                await WaitHelper.waitForVisible(locator, timeout);

                await locator.scrollIntoViewIfNeeded();

                await locator.hover({ timeout });

            }

        });

    }

    public static async doubleClick(
        locator: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_DOUBLE_CLICK,

            errorType: ErrorType.MOUSE,

            successMessage: "Double click successful.",

            failureMessage: "Failed to double click.",

            action: async () => {

                await WaitHelper.waitForVisible(locator, timeout);

                await WaitHelper.waitForEnabled(locator, timeout);

                await locator.scrollIntoViewIfNeeded();

                await locator.dblclick({ timeout });

            }

        });

    }

    public static async rightClick(
        locator: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_RIGHT_CLICK,

            errorType: ErrorType.MOUSE,

            successMessage: "Right click successful.",

            failureMessage: "Failed to right click.",

            action: async () => {

                await WaitHelper.waitForVisible(locator, timeout);

                await WaitHelper.waitForEnabled(locator, timeout);

                await locator.scrollIntoViewIfNeeded();

                await locator.click({

                    button: "right",

                    timeout

                });

            }

        });

    }

    public static async dragAndDrop(
        source: Locator,
        target: Locator,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_DRAG_AND_DROP,

            errorType: ErrorType.MOUSE,

            successMessage: "Drag and drop successful.",

            failureMessage: "Failed to drag and drop.",

            action: async () => {

                await WaitHelper.waitForVisible(source, timeout);

                await WaitHelper.waitForVisible(target, timeout);

                await source.dragTo(target, { timeout });

            }

        });

    }

    public static async move(
        page: Page,
        x: number,
        y: number
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_MOVE,

            errorType: ErrorType.MOUSE,

            successMessage: "Mouse moved.",

            failureMessage: "Failed to move mouse.",

            action: async () => {

                await page.mouse.move(x, y);

            }

        });

    }

    public static async mouseDown(
        page: Page
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_DOWN,

            errorType: ErrorType.MOUSE,

            successMessage: "Mouse button pressed.",

            failureMessage: "Failed to press mouse button.",

            action: async () => {

                await page.mouse.down();

            }

        });

    }

    public static async mouseUp(
        page: Page
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_UP,

            errorType: ErrorType.MOUSE,

            successMessage: "Mouse button released.",

            failureMessage: "Failed to release mouse button.",

            action: async () => {

                await page.mouse.up();

            }

        });

    }

    public static async mouseWheel(
        page: Page,
        deltaX: number,
        deltaY: number
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.MOUSE_WHEEL,

            errorType: ErrorType.MOUSE,

            successMessage: "Mouse wheel action completed.",

            failureMessage: "Failed to perform mouse wheel action.",

            action: async () => {

                await page.mouse.wheel(deltaX, deltaY);

            }

        });

    }

}