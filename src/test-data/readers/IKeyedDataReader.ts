import { IDataReader } from "./IDataReader";

export interface IKeyedDataReader<T>
    extends IDataReader<T> {

    get(key: string): T;

    exists(key: string): boolean;

}