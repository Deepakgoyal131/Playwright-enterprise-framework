import {test, expect} from '@playwright/test'
import { ClickHelper, WaitHelper, FillHelper } from '@core/helpers/interaction';
import { ScreenshotHelper } from '@core/helpers/diagnostics/ScreenshotHelper';
import { AssertionHelper } from '@core/helpers/assertions/AssertionHelper';

test("check Click Helper", async ({page}) => {
    await page.goto("/practice-test-login/");
    await FillHelper.fill(page.locator("#username"), "student");
    await ScreenshotHelper.capture(page, "Login Page");
    await FillHelper.fill(page.locator("#password"), "Password123");
    await ScreenshotHelper.captureElement(page.locator("#username"));
    await ClickHelper.click(page.locator('#submit'));
    // await WaitHelper.waitForText(page.locator("#error"), "Your username is invalid!");
    await WaitHelper.waitForText(page.getByText("Logged In Successfully"), "Logged In Successfully")
    await AssertionHelper.assertText(page.getByText("Logged In Successfully"), "Logged In Successfully!")
})