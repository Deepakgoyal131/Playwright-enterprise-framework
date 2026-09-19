import { TestTag } from "./TestTags";

export interface TestMetadata {
    tags?: TestTag[];
    owner?: string;
    feature?: string;
    module?: string;
}