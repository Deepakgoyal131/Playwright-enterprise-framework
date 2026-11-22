import { AssertionHelper } from "@core/helpers/assertions/AssertionHelper";
import { BasePage } from "@pages/base/BasePage";
import { Page, Locator } from "@playwright/test";

export class SamplePage extends BasePage{
    // Elements
    readonly inpUsername: Locator;
    readonly inpPassward: Locator;
    readonly btnSubmit: Locator;
    readonly txtStatus: Locator;

    constructor(page: Page){
        super(page);
        this.inpUsername = page.getByPlaceholder("User Name");
        this.inpPassward = page.getByPlaceholder("********");
        this.btnSubmit = page.locator("#login");
        this.txtStatus = page.locator("#loginstatus")
    }

    async goto(){
        await this.page.goto('/sampleapp');
    }

    private async fillUsername(username: string){
        await this.inpUsername.fill(username)
    }

    private async fillPassword(password: string){
        await this.inpPassward.fill(password);
    }

    async login(username: string, password: string){
        await this.fillUsername(username);
        await this.fillPassword(password);
        await this.btnSubmit.click();
    }

    async verifyLoggedIn(){
        await AssertionHelper.assertText(this.txtStatus, "Welcome, Test!")
    }

}
