import type { BrowserContext, Page } from "@playwright/test";
import { ErrorHandler, ErrorType } from "../../core/errors";
import type { UIAuthenticationConfig } from "../../../configs/types/FrameworkConfig.types";
import type {
  AuthStrategy,
  AuthStrategyResult,
  AuthUser,
} from "../types/Auth.types";

export class UIAuthStrategy implements AuthStrategy {
  public constructor(
    private readonly config: UIAuthenticationConfig,
    private readonly baseURL: string,
    private readonly timeout: number,
  ) {}

  public async authenticate(
    user: AuthUser,
    context: BrowserContext,
  ): Promise<AuthStrategyResult> {
    let page: Page | undefined;
    try {
      page = await context.newPage();
      const loginUrl = this.resolveApplicationUrl(this.config.loginPath);
      await page.goto(loginUrl, { timeout: this.timeout });
      await page
        .locator(this.config.usernameSelector)
        .fill(user.credentials.username);
      await page
        .locator(this.config.passwordSelector)
        .fill(user.credentials.password);
      await page.locator(this.config.submitSelector).click();
      await page.locator(this.config.authenticatedSelector).waitFor({
        state: "visible",
        timeout: this.timeout,
      });
      return {};
    } catch (error) {
      return ErrorHandler.handle(
        ErrorType.FRAMEWORK,
        "UIAuthStrategy.authenticate",
        "UI authentication failed. Verify the configured login flow and credentials.",
        new Error("UI authentication failed; sensitive values were omitted.", {
          cause: error instanceof Error ? error.name : undefined,
        }),
      );
    } finally {
      await page?.close().catch(() => undefined);
    }
  }

  public async validateSession(
    _user: AuthUser,
    context: BrowserContext,
  ): Promise<boolean> {
    if (!this.config.validationPath) {
      return true;
    }
    let page: Page | undefined;
    try {
      page = await context.newPage();
      const validationUrl = this.resolveApplicationUrl(
        this.config.validationPath,
      );
      await page.goto(validationUrl, { timeout: this.timeout });
      await page.locator(this.config.authenticatedSelector).waitFor({
        state: "visible",
        timeout: this.timeout,
      });
      return true;
    } catch {
      return false;
    } finally {
      await page?.close().catch(() => undefined);
    }
  }

  private resolveApplicationUrl(configuredPath: string): string {
    const applicationUrl = new URL(this.baseURL);
    const resolvedUrl = new URL(configuredPath, applicationUrl);
    if (resolvedUrl.origin !== applicationUrl.origin) {
      throw new Error(
        "Configured authentication path must remain on the application origin.",
      );
    }
    return resolvedUrl.toString();
  }
}
