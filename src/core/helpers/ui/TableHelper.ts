import { Locator } from "@playwright/test";
import { ActionExecutor } from "@core/executor/ActionExecutor";
import { ActionNames } from "@core/enum";
import { ErrorType } from "@core/errors";

export interface TableRowCriteria {

    column: string;

    value: string;
}

export class TableHelper {

    private constructor() {}

    /**
     * Get table rows.
     */
    public static rows(
        table: Locator
    ): Locator {

        return table.locator("tbody tr");
    }

    /**
     * Get row count.
     */
    public static async rowCount(
        table: Locator
    ): Promise<number> {

        return await ActionExecutor.execute({
            actionName: ActionNames.TABLE_ROW_COUNT,
            errorType: ErrorType.TABLE,
            successMessage: "Table row count retrieved successfully.",
            failureMessage: "Failed to get the table row count.",
            action: async () => {
                return this.rows(table).count();
            }
        }).then(result => result.data ?? 0);
    }

    /**
     * Find a row using text.
     */
    public static async findRow(
        table: Locator,
        criteria: TableRowCriteria
    ): Promise<Locator> {

        return await ActionExecutor.execute({
            actionName: ActionNames.TABLE_FIND_ROW,
            errorType: ErrorType.TABLE,
            successMessage: `Table row found for ${criteria.column}=${criteria.value}.`,
            failureMessage: `Table row not found. ${criteria.column} = ${criteria.value}`,
            action: async () => {
                const rows = this.rows(table);
                const count = await rows.count();

                for (let index = 0; index < count; index++) {
                    const row = rows.nth(index);
                    const text = await row.innerText();

                    if (text.includes(criteria.value)) {
                        return row;
                    }
                }

                throw new Error(`Table row not found. ${criteria.column} = ${criteria.value}`);
            }
        }).then(result => result.data as Locator);
    }

    /**
     * Click an action inside a row.
     */
    public static async clickRowAction(
        table: Locator,
        criteria: TableRowCriteria,
        actionText: string
    ): Promise<void> {

        await ActionExecutor.execute({
            actionName: ActionNames.TABLE_CLICK_ROW_ACTION,
            errorType: ErrorType.TABLE,
            successMessage: `Clicked action "${actionText}" within the matching table row.`,
            failureMessage: `Failed to click action "${actionText}" in the table row.`,
            action: async () => {
                const row = await this.findRow(table, criteria);
                await row.getByText(actionText, { exact: true }).click();
            }
        });
    }

    /**
     * Get cell text.
     */
    public static async getCellText(
        row: Locator,
        columnIndex: number
    ): Promise<string> {

        return await ActionExecutor.execute({
            actionName: ActionNames.TABLE_GET_CELL_TEXT,
            errorType: ErrorType.TABLE,
            successMessage: "Table cell text retrieved successfully.",
            failureMessage: "Failed to get table cell text.",
            action: async () => {
                return (await row.locator("td").nth(columnIndex).innerText()).trim();
            }
        }).then(result => result.data ?? "");
    }

    /**
     * Get all row texts.
     */
    public static async getAllRows(
        table: Locator
    ): Promise<string[]> {

        return await ActionExecutor.execute({
            actionName: ActionNames.TABLE_GET_ALL_ROWS,
            errorType: ErrorType.TABLE,
            successMessage: "All table rows retrieved successfully.",
            failureMessage: "Failed to get all table rows.",
            action: async () => {
                return await this.rows(table).allInnerTexts();
            }
        }).then(result => result.data ?? []);
    }
}