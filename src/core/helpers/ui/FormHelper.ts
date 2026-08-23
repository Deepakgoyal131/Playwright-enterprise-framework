import { Locator } from "@playwright/test";

import { FillHelper } from "@core/helpers/interaction/FillHelper";
import { ClickHelper } from "@core/helpers/interaction/ClickHelper";
import { DropdownHelper } from "./DropdownHelper";
import { CheckboxHelper } from "./CheckboxHelper";
import { RadioHelper } from "./RadioHelper";

export class FormHelper {

    private constructor() {}

    public static async fill(
        locator: Locator,
        value: string
    ): Promise<void> {

        await FillHelper.fill(locator, value);
    }

    public static async click(
        locator: Locator
    ): Promise<void> {

        await ClickHelper.click(locator);
    }

    public static async check(
        locator: Locator
    ): Promise<void> {

        await CheckboxHelper.check(locator);
    }

    public static async uncheck(
        locator: Locator
    ): Promise<void> {

        await CheckboxHelper.uncheck(locator);
    }

    public static async selectRadio(
        locator: Locator
    ): Promise<void> {

        await RadioHelper.select(locator);
    }

    public static async selectDropdown(
        locator: Locator,
        value: string
    ): Promise<void> {

        await DropdownHelper.selectByText(locator, value);
    }
}