import { Page, Locator } from "@playwright/test";
import { FillHelper, ClickHelper } from "@core/helpers";

export abstract class BasePage {

    protected readonly page: Page;

    constructor(page: Page) {

        this.page = page;

    }

    protected async click(locator: Locator): Promise<void> {
        await ClickHelper.click(locator);
    }

    protected async fill(locator: Locator, value: string): Promise<void> {
        await FillHelper.fill(locator, value);
    }

    protected async goto(url: string): Promise<void> {
        await this.page.goto(url);
    }

    protected get currentUrl(): string {
        return this.page.url();
    }

    protected async title(): Promise<string> {
        return this.page.title();
    }

    protected async refresh(): Promise<void> {
        await this.page.reload();
    }


}