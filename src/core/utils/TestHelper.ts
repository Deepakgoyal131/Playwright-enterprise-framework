import { TestTag } from "@core/types/TestTags";

export class TestHelper {

    private constructor() {}

    public static tags(
        ...tags: TestTag[]
    ): string {
        return tags.join(" ");
    }

    public static testName(
        name: string,
        ...tags: TestTag[]
    ): string {

        if (tags.length === 0) {
            return name;
        }

        return `${name} ${this.tags(...tags)}`;
    }
}