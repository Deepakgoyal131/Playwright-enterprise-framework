import {
    Locator,
    Page,
    type AriaRole
} from "@playwright/test";

export class LocatorHelper {

    private constructor() {}

    public static byTestId(
        page: Page,
        testId: string
    ): Locator {

        return page.getByTestId(testId);
    }

    public static byText(
        page: Page,
        text: string,
        exact = true
    ): Locator {

        return page.getByText(text, { exact });
    }

    public static byRole(
        page: Page,
        role: AriaRole,
        name?: string,
        exact = true
    ): Locator {

        if (name === undefined) {
            return page.getByRole(role);
        }

        return page.getByRole(role, {
            name,
            exact
        });
    }

    public static byLabel(
        page: Page,
        label: string,
        exact = true
    ): Locator {

        return page.getByLabel(label, { exact });
    }

    public static byPlaceholder(
        page: Page,
        placeholder: string,
        exact = true
    ): Locator {

        return page.getByPlaceholder(placeholder, { exact });
    }

    public static css(
        page: Page,
        selector: string
    ): Locator {

        return page.locator(selector);
    }

    public static xpath(
        page: Page,
        selector: string
    ): Locator {

        return page.locator(`xpath=${selector}`);
    }
}