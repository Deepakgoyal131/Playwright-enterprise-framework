import { Faker } from '@faker-js/faker/.';
import {test, expect} from '@playwright/test'
// import { ClickHelper, WaitHelper, FillHelper } from '@core/helpers/interaction';
// import { ScreenshotHelper } from '@core/helpers/diagnostics/ScreenshotHelper';
// import { AssertionHelper } from '@core/helpers/assertions/AssertionHelper';
import { FakerFactory, TestDataManager, TestDataFactory } from '@test-data';

// test("check Click Helper", async ({page}) => {
//     await page.goto("/practice-test-login/");
//     await FillHelper.fill(page.locator("#username"), "student");
//     await ScreenshotHelper.capture(page, "Login Page");
//     await FillHelper.fill(page.locator("#password"), "Password123");
//     await ScreenshotHelper.captureElement(page.locator("#username"));
//     await ClickHelper.click(page.locator('#submit'));
//     // await WaitHelper.waitForText(page.locator("#error"), "Your username is invalid!");
//     await WaitHelper.waitForText(page.getByText("Logged In Successfully"), "Logged In Successfully")
//     await AssertionHelper.assertText(page.getByText("Logged In Successfully"), "Logged In Successfully!")
// })



test("Admin Login Check Test Data via JsonReader", async ({ page }) => {

    const login =
        TestDataManager.login("admin");

    const customer = FakerFactory.customer()
    console.log(customer);
    console.log(login.username);
    console.log(login.password);

});

test("Test Data Framework", async () => {

    const login =
        TestDataManager.login("admin");

    expect(login.username)
        .toBe("admin");

    const customer =
        TestDataManager.customer();

    expect(customer.firstName)
        .toBeTruthy();

    const dynamicCustomer =
        TestDataFactory.customer({
            city: "Indore"
        });

    expect(dynamicCustomer.city)
        .toBe("Indore");

    console.log("Login:", login);

    console.log(
        "Static Customer:",
        customer
    );

    console.log(
        "Dynamic Customer:",
        dynamicCustomer
    );

});