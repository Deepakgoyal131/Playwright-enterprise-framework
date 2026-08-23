export interface IDataReader<T> {

    /**
     * Read the complete data source.
     */
    read(): T[];

}