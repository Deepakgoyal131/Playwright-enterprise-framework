export class RandomDataFactory {

    private constructor() {}

    public static number(
        min: number,
        max: number
    ): number {

        if (min > max) {

            throw new Error(
                `Invalid range: min (${min}) ` +
                `cannot be greater than max (${max}).`
            );

        }

        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;

    }

    public static boolean(): boolean {

        return Math.random() >= 0.5;

    }

    public static string(
        length: number
    ): string {

        if (length <= 0) {

            throw new Error(
                "String length must be greater than 0."
            );

        }

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        let result = "";

        for (let i = 0; i < length; i++) {

            const index =
                Math.floor(
                    Math.random() *
                    characters.length
                );

            result += characters[index];

        }

        return result;

    }

}