export type TestDataSource =
    | "json"
    | "excel"
    | "csv";

export interface TestDataOptions {

    source?: TestDataSource;

    key?: string;

}