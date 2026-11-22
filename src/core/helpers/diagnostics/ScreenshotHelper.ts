import { Locator, Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import path from "path";
import fs from "fs";
import { FrameworkConfig } from "configs/FrameworkConfig";
import { Logger } from "@core/logger";

export class ScreenshotHelper {

    private static getTimestamp(): string {

        return new Date()
            .toISOString()
            .replace(/[:.]/g, "-");

    }

    private static ensureDirectory(): void {

        const directory =
            FrameworkConfig.screenshot.directory;

        if (!fs.existsSync(directory)) {

            fs.mkdirSync(directory, {
                recursive: true
            });

        }

    }

    private static buildFileName(name?: string): string {

        const safeName = (name ?? "Screenshot")
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");

        const timestamp =
            FrameworkConfig.screenshot.timestamp
                ? `_${this.getTimestamp()}`
                : "";

        return `${safeName}${timestamp}_${randomUUID()}.png`;

    }

    public static async capture(

        page: Page,

        name?: string

    ): Promise<string> {

        if (!FrameworkConfig.screenshot.enabled) {

            return "";

        }

        this.ensureDirectory();

        const filePath = path.join(

            FrameworkConfig.screenshot.directory,

            this.buildFileName(name)

        );

        await page.screenshot({

            path: filePath,

            fullPage: FrameworkConfig.screenshot.fullPage

        });

        Logger.info(
            `Screenshot saved : ${filePath}`
        );

        return filePath;

    }

    public static async captureElement(

        locator: Locator,

        name?: string

    ): Promise<string> {

        if (!FrameworkConfig.screenshot.enabled) {

            return "";

        }

        this.ensureDirectory();

        const filePath = path.join(

            FrameworkConfig.screenshot.directory,

            this.buildFileName(name)

        );

        await locator.screenshot({

            path: filePath

        });

        Logger.info(
            `Element screenshot saved : ${filePath}`
        );

        return filePath;

    }

    public static async captureFailure(

        page: Page,

        action: string

    ): Promise<void> {

        if (!FrameworkConfig.screenshot.captureOnFailure) {

            return;

        }

        await this.capture(

            page,

            `${action}_FAILED`

        );

    }

}
