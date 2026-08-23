import fs from "fs";
import path from "path";
import { IDataReader } from "./IDataReader";

export class JsonReader<T extends object>
    implements IDataReader<T> {

    private readonly filePath: string;

    private readonly data: Record<string, T>;

    private static readonly cache =
        new Map<string, Record<string, unknown>>();

    constructor(
        fileName: string,
        baseDirectory = "src/test-data/data/json"
    ) {

        this.filePath = path.resolve(
            process.cwd(),
            baseDirectory,
            fileName
        );

        this.data = this.load();

    }

    private load(): Record<string, T> {

        const cached =
            JsonReader.cache.get(this.filePath);

        if (cached) {

            return cached as Record<string, T>;

        }

        if (!fs.existsSync(this.filePath)) {

            throw new Error(
                `Test data JSON file not found: ${this.filePath}`
            );

        }

        let content: string;

        try {

            content =
                fs.readFileSync(
                    this.filePath,
                    "utf-8"
                );

        } catch (error) {

            throw new Error(
                `Unable to read JSON file: ${this.filePath}. ` +
                `Reason: ${this.getErrorMessage(error)}`
            );

        }

        try {

            const parsed: unknown =
                JSON.parse(content);

            if (
                parsed === null ||
                typeof parsed !== "object" ||
                Array.isArray(parsed)
            ) {

                throw new Error(
                    "Root JSON value must be an object."
                );

            }

            const result =
                parsed as Record<string, T>;

            JsonReader.cache.set(
                this.filePath,
                result as Record<string, unknown>
            );

            return result;

        } catch (error) {

            throw new Error(
                `Invalid JSON in file: ${this.filePath}. ` +
                `Reason: ${this.getErrorMessage(error)}`
            );

        }

    }

    public read(): Record<string, T> {

        return this.data;

    }

    public get(key: string): T {

        if (!this.exists(key)) {

            const availableKeys =
                Object.keys(this.data).join(", ");

            throw new Error(
                `Test data key '${key}' not found in ` +
                `${path.basename(this.filePath)}. ` +
                `Available keys: [${availableKeys}]`
            );

        }

        return this.data[key];

    }

    public exists(key: string): boolean {

        return Object.prototype.hasOwnProperty.call(
            this.data,
            key
        );

    }

    public static clearCache(): void {

        JsonReader.cache.clear();

    }

    public static clearFileCache(
        filePath: string
    ): void {

        JsonReader.cache.delete(
            path.resolve(filePath)
        );

    }

    private getErrorMessage(error: unknown): string {

        if (error instanceof Error) {

            return error.message;

        }

        return String(error);

    }

}