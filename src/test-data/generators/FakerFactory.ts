import { faker } from "@faker-js/faker";

import { CustomerData } from "../models/CustomerData";

export class FakerFactory {

    private constructor() {}

    public static customer(
        overrides: Partial<CustomerData> = {}
    ): CustomerData {

        return {

            firstName:
                faker.person.firstName(),

            lastName:
                faker.person.lastName(),

            email:
                faker.internet.email(),

            phone:
                faker.string.numeric(10),

            city:
                faker.location.city(),

            state:
                faker.location.state(),

            ...overrides

        };

    }

    public static email(): string {

        return faker.internet.email();

    }

    public static firstName(): string {

        return faker.person.firstName();

    }

    public static lastName(): string {

        return faker.person.lastName();

    }

    public static phone(): string {

        return faker.string.numeric(10);

    }

}