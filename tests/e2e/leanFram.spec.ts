// import { test } from '@fixtures/BaseTest'
import {test} from '@fixtures/adminFixture/adminFixture'
import { AssertionHelper } from '@core/helpers/assertions/AssertionHelper';
import { AllureHelper } from '@fixtures/BaseTest';
import { FileUploadHelper } from '@core/helpers/ui/FileUploadHelper';

test.describe("Learning how to use framework", function () {

    /*
    test("My First Test", async ({ page }) => {
        await AllureHelper.addMetadata({
            severity: "critical",
            epic: "Customer Management",
            feature: "Customer API",
            story: "Create a customer",
            owner: "QA Team",
        });

        await AllureHelper.step("Navigate to sample App", async ()=>{
            await page.goto('/sampleapp');
        })
        
        const username = page.getByPlaceholder("User Name");
        const password = page.getByPlaceholder("********");
        const submit = page.locator("#login");
        const stautus = page.locator("#loginstatus")

        //action

        await AllureHelper.step("Fill Login Details", async ()=>{
            await username.fill("Test");
            await password.fill("pwd");
            await submit.click();
        })
        
        await AllureHelper.step("Assert Login", async ()=>{
            await AssertionHelper.assertText(stautus, "Welcom, Test!");
        })
    });
    */

    //With use of Page Object
    test("Use Page Object", async ({page, samplePage})=>{
        // await samplePage.goto();
        // await samplePage.login("Test", "pwd");
        // await samplePage.verifyLoggedIn();

        await page.goto('/upload');
        const inpFile = page.locator("#browse");
        await FileUploadHelper.upload(inpFile, "D:/Sample Doc.pdf");

        await page.waitForTimeout(2000);

    })


})