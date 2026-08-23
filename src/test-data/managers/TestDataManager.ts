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

    private constructor() {}

    // -------------------------------
    // Login
    // -------------------------------

    private static getLoginReader():
        JsonReader<LoginData> {

        if (!this.loginReader) {

            this.loginReader =
                new JsonReader<LoginData>(
                    "login.json"
                );
        }

        return this.loginReader;
    }

    public static login(
        key: string = "admin"
    ): LoginData {

        return this
            .getLoginReader()
            .get(key);
    }

    public static allLoginData():
        LoginData[] {

        return Object.values(
            this.getLoginReader().read()
        );
    }

    // -------------------------------
    // Customer
    // -------------------------------

    private static getCustomerReader():
        JsonReader<CustomerData> {

        if (!this.customerReader) {

            this.customerReader =
                new JsonReader<CustomerData>(
                    "customer.json"
                );
        }

        return this.customerReader;
    }

    public static customer(
        key: string = "defaultCustomer"
    ): CustomerData {

        return this
            .getCustomerReader()
            .get(key);
    }

    public static allCustomerData():
        CustomerData[] {

        return Object.values(
            this.getCustomerReader().read()
        );
    }

    // -------------------------------
    // Payment
    // -------------------------------

    private static getPaymentReader():
        JsonReader<PaymentData> {

        if (!this.paymentReader) {

            this.paymentReader =
                new JsonReader<PaymentData>(
                    "payment.json"
                );
        }

        return this.paymentReader;
    }

    public static payment(
        key: string = "validPayment"
    ): PaymentData {

        return this
            .getPaymentReader()
            .get(key);
    }

    public static allPaymentData():
        PaymentData[] {

        return Object.values(
            this.getPaymentReader().read()
        );
    }
}