import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { IKeyedDataReader } from "./IKeyedDataReader";

export class CsvReader<T extends object>
    implements IKeyedDataReader<T> {

    private readonly filePath: string;

    private readonly data: T[];

    constructor(
        fileName: string,
        baseDirectory = "src/test-data/data/csv"
    ) {
        this.filePath = path.resolve(
            process.cwd(),
            baseDirectory,
            fileName
        );

        this.data = this.load();
    }

    /**
     * Load CSV file and convert rows into typed objects.
     */
    private load(): T[] {

        if (!fs.existsSync(this.filePath)) {

            throw new Error(
                `CSV file not found: ${this.filePath}`
            );
        }

        try {

            const content =
                fs.readFileSync(
                    this.filePath,
                    "utf-8"
                );

            return parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true
            }) as T[];

        } catch (error) {

            if (error instanceof Error) {

                throw new Error(
                    `Unable to read CSV file ` +
                    `${this.filePath}: ${error.message}`
                );
            }

            throw error;
        }
    }

    /**
     * Return all CSV records.
     */
    public read(): T[] {

        return this.data;
    }

    /**
     * Get a record using key or id.
     */
    public get(key: string): T {

        const record =
            this.data.find(item => {

                const value =
                    item as Record<string, unknown>;

                return (
                    String(value["key"]) === key ||
                    String(value["id"]) === key
                );
            });

        if (!record) {

            throw new Error(
                `CSV test data '${key}' not found in ` +
                `${path.basename(this.filePath)}`
            );
        }

        return record;
    }

    /**
     * Check whether a record exists.
     */
    public exists(key: string): boolean {

        return this.data.some(item => {

            const value =
                item as Record<string, unknown>;

            return (
                String(value["key"]) === key ||
                String(value["id"]) === key
            );
        });
    }
}