export interface DataDrivenContext<T> {

    data: T;

    index: number;

    total: number;

}

/**
 * Callback executed for each test dataset.
 */
export type DataDrivenCallback<T> = (
    context: DataDrivenContext<T>
) => Promise<void>;

/**
 * Function used to generate a readable
 * identifier for a dataset.
 */
export type DataIdentifier<T> = (
    data: T,
    index: number
) => string;