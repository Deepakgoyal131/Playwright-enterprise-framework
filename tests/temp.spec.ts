import {test, expect} from '@playwright/test'
import { ClickHelper, WaitHelper, FillHelper } from '@core/helpers';

test("check Click Helper", async ({page}) => {
    await page.goto("/practice-test-login/");
    await FillHelper.fill(page.locator("#username"), "student");
    await FillHelper.fill(page.locator("#password"), "Password123");
    await ClickHelper.click(page.locator('#submit'));
    // await WaitHelper.waitForText(page.locator("#error"), "Your username is invalid!");
    await WaitHelper.waitForText(page.getByText("Logged In Successfully"), "Logged In Successfully")
})