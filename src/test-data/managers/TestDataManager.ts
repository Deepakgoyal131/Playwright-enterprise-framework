import { JsonReader } from "../readers/JsonReader";

import { LoginData } from "../models/LoginData";
import { CustomerData } from "../models/CustomerData";
import { PaymentData } from "../models/PaymentData";

export class TestDataManager {

    private static loginReader:
        JsonReader<LoginData>;

    private static customerReader:
        JsonReader<CustomerData>;

    private static paymentReader:
        JsonReader<PaymentData>;

    private constructor() {
        // Prevent instantiation.
    }

    // --------------------------------------------------
    // Login Data
    // --------------------------------------------------

    public static login(
        key: string = "admin"
    ): LoginData {

        if (!this.loginReader) {

            this.loginReader =
                new JsonReader<LoginData>(
                    "login.json"
                );

        }

        return this.loginReader.get(key);

    }

    // --------------------------------------------------
    // Customer Data
    // --------------------------------------------------

    public static customer(
        key: string = "defaultCustomer"
    ): CustomerData {

        if (!this.customerReader) {

            this.customerReader =
                new JsonReader<CustomerData>(
                    "customer.json"
                );

        }

        return this.customerReader.get(key);

    }

    // --------------------------------------------------
    // Payment Data
    // --------------------------------------------------

    public static payment(
        key: string = "validPayment"
    ): PaymentData {

        if (!this.paymentReader) {

            this.paymentReader =
                new JsonReader<PaymentData>(
                    "payment.json"
                );

        }

        return this.paymentReader.get(key);

    }

}