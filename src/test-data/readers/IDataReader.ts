export interface IDataReader<T> {

    /**
     * Read the complete data source.
     */
    read(): T[];

    /**
     * Get a specific record by key.
     */
    get(key: string): T;

    /**
     * Check whether a record exists.
     */
    exists(key: string): boolean;

}