import {
    DataDrivenCallback,
    DataIdentifier
} from "../types/DataDrivenTypes";

export class DataDrivenHelper {

    private constructor() {}

    /**
     * Execute a callback for every dataset.
     */
    public static async execute<T>(
        data: T[],
        callback: DataDrivenCallback<T>
    ): Promise<void> {

        if (!Array.isArray(data)) {

            throw new Error(
                "DataDrivenHelper.execute() expects an array."
            );
        }

        if (typeof callback !== "function") {

            throw new Error(
                "DataDrivenHelper.execute() expects a callback."
            );
        }

        for (
            let index = 0;
            index < data.length;
            index++
        ) {

            await callback({

                data: data[index],

                index,

                total: data.length

            });

        }
    }

    /**
     * Generate a readable test name.
     */
    public static testName<T>(
        prefix: string,
        data: T,
        index: number,
        identifier?: DataIdentifier<T>
    ): string {

        const name =
            identifier
                ? identifier(data, index)
                : String(index + 1);

        return `${prefix} - ${name}`;
    }

    /**
     * Return total dataset count.
     */
    public static count<T>(
        data: T[]
    ): number {

        return data.length;
    }

    /**
     * Check whether data exists.
     */
    public static hasData<T>(
        data: T[]
    ): boolean {

        return (
            Array.isArray(data) &&
            data.length > 0
        );
    }

    /**
     * Get a dataset by index.
     */
    public static get<T>(
        data: T[],
        index: number
    ): T {

        if (
            index < 0 ||
            index >= data.length
        ) {

            throw new Error(
                `Dataset index '${index}' is out of range. ` +
                `Total datasets: ${data.length}`
            );
        }

        return data[index];
    }
}