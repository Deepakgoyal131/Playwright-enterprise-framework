import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { IKeyedDataReader } from "./IKeyedDataReader";

export class ExcelReader<T extends object>
    implements IKeyedDataReader<T> {

    private readonly filePath: string;

    private readonly data: T[];

    constructor(
        fileName: string,
        sheetName?: string,
        baseDirectory = "src/test-data/data/excel"
    ) {
        this.filePath = path.resolve(
            process.cwd(),
            baseDirectory,
            fileName
        );

        this.data = this.load(sheetName);
    }

    private load(sheetName?: string): T[] {

        if (!fs.existsSync(this.filePath)) {
            throw new Error(
                `Excel file not found: ${this.filePath}`
            );
        }

        try {

            const workbook =
                XLSX.readFile(this.filePath);

            const selectedSheet =
                sheetName ??
                workbook.SheetNames[0];

            if (!selectedSheet) {
                throw new Error(
                    `No worksheet found in ${this.filePath}`
                );
            }

            const worksheet =
                workbook.Sheets[selectedSheet];

            if (!worksheet) {
                throw new Error(
                    `Worksheet '${selectedSheet}' not found. ` +
                    `Available sheets: ${workbook.SheetNames.join(", ")}`
                );
            }

            return XLSX.utils.sheet_to_json<T>(
                worksheet,
                {
                    defval: ""
                }
            );

        } catch (error) {

            if (error instanceof Error) {
                throw new Error(
                    `Unable to read Excel file ` +
                    `${this.filePath}: ${error.message}`
                );
            }

            throw error;
        }
    }

    public read(): T[] {
        return this.data;
    }

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
                `Excel test data '${key}' not found in ` +
                `${path.basename(this.filePath)}`
            );
        }

        return record;
    }

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