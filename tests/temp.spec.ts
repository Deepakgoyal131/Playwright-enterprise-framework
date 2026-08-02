import {test, expect} from '@playwright/test'
import { ClickHelper } from "@core/helpers/ClickHelper";
import { WaitHelper } from '@core/helpers/WaitHelper';

test("check Click Helper", async ({page}) => {
    await page.goto("/practice-test-login/");
    await ClickHelper.click(page.locator('#submit'));
    await WaitHelper.waitForText(page.locator("#error"), "Your username is invalid!");
})