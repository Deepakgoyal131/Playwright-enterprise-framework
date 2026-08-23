import fs from "fs";
import path from "path";
import { Locator } from "@playwright/test";

import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors";

export class FileUploadHelper {

    private constructor() {}

    /**
     * Upload a single file.
     */
    public static async upload(
        locator: Locator,
        filePath: string
    ): Promise<void> {

        const absolutePath =
            path.resolve(filePath);

        if (!fs.existsSync(absolutePath)) {
            throw new Error(`Upload file not found: ${absolutePath}`);
        }

        await ActionExecutor.execute({
            actionName: ActionNames.FILE_UPLOAD,
            errorType: ErrorType.UPLOAD,
            successMessage: `File uploaded successfully: ${absolutePath}`,
            failureMessage: `Failed to upload file: ${absolutePath}`,
            action: async () => {
                await locator.setInputFiles(absolutePath);
            }
        });
    }

    /**
     * Upload multiple files.
     */
    public static async uploadMultiple(
        locator: Locator,
        filePaths: string[]
    ): Promise<void> {

        const absolutePaths =
            filePaths.map(filePath => path.resolve(filePath));

        for (const filePath of absolutePaths) {
            if (!fs.existsSync(filePath)) {
                throw new Error(`Upload file not found: ${filePath}`);
            }
        }

        await ActionExecutor.execute({
            actionName: ActionNames.FILE_UPLOAD_MULTIPLE,
            errorType: ErrorType.UPLOAD,
            successMessage: "Multiple files uploaded successfully.",
            failureMessage: "Failed to upload multiple files.",
            action: async () => {
                await locator.setInputFiles(absolutePaths);
            }
        });
    }

    /**
     * Clear uploaded files.
     */
    public static async clear(
        locator: Locator
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.FILE_UPLOAD_CLEAR,
            errorType: ErrorType.UPLOAD,
            successMessage: "Uploaded files cleared successfully.",
            failureMessage: "Failed to clear uploaded files.",
            action: async () => {
                await locator.setInputFiles([]);
            }
        });
    }
}