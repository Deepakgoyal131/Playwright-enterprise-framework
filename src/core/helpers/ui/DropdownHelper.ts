import { Locator } from "@playwright/test";

import { ActionExecutor } from "@core/executor/ActionExecutor";
import { WaitHelper } from "@core/helpers/interaction";
import { ClickHelper } from "@core/helpers/interaction";
import { FillHelper } from "@core/helpers/interaction";
import { AssertionHelper } from "../assertions/AssertionHelper";

import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors/ErrorType";

import { FrameworkConfig } from "configs/FrameworkConfig";

export class DropdownHelper {

    public static async selectByText(
        dropdown: Locator,
        text: string,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.DROPDOWN_SELECT_TEXT,

            errorType: ErrorType.DROPDOWN,

            successMessage: `Selected "${text}"`,

            failureMessage: `Unable to select "${text}"`,

            action: async () => {

                await WaitHelper.waitForVisible(dropdown, timeout);

                await dropdown.selectOption({

                    label: text

                });

            }

        });

    }

    public static async selectByValue(
        dropdown: Locator,
        value: string,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.DROPDOWN_SELECT_VALUE,

            errorType: ErrorType.DROPDOWN,

            successMessage: `Selected value "${value}"`,

            failureMessage: `Unable to select value "${value}"`,

            action: async () => {

                await WaitHelper.waitForVisible(dropdown, timeout);

                await dropdown.selectOption({

                    value

                });

            }

        });

    }

    public static async selectByIndex(
        dropdown: Locator,
        index: number,
        timeout = FrameworkConfig.timeout.action
    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.DROPDOWN_SELECT_LABEL,

            errorType: ErrorType.DROPDOWN,

            successMessage: `Selected index ${index}`,

            failureMessage: `Unable to select index ${index}`,

            action: async () => {

                await WaitHelper.waitForVisible(dropdown, timeout);

                await dropdown.selectOption({

                    index

                });

            }

        });

    }

    public static async selectSearchable(

        dropdown: Locator,

        searchInput: Locator,

        option: Locator,

        value: string,

        timeout = FrameworkConfig.timeout.action

    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.DROPDOWN_SEARCH,

            errorType: ErrorType.DROPDOWN,

            successMessage: `Selected "${value}"`,

            failureMessage: `Unable to select "${value}"`,

            action: async () => {

                await ClickHelper.click(dropdown);

                await FillHelper.fill(searchInput, value);

                await AssertionHelper.assertVisible(option);

                await ClickHelper.click(option);

            }

        });

    }

    public static async selectMulti(

        dropdown: Locator,

        optionLocator: (value: string) => Locator,

        values: string[]

    ): Promise<void> {

        await ActionExecutor.execute({

            actionName: ActionNames.DROPDOWN_MULTI,

            errorType: ErrorType.DROPDOWN,

            successMessage: "Multi-select completed.",

            failureMessage: "Unable to perform multi-select.",

            action: async () => {

                await ClickHelper.click(dropdown);

                for (const value of values) {

                    await ClickHelper.click(

                        optionLocator(value)

                    );

                }

            }

        });

    }

}