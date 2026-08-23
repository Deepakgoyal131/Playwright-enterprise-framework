import { CustomerData } from "../models/CustomerData";
import { FakerFactory } from "./FakerFactory";

export class TestDataFactory {

    private constructor() {}

    public static customer(
        overrides: Partial<CustomerData> = {}
    ): CustomerData {

        return FakerFactory.customer(
            overrides
        );

    }

}