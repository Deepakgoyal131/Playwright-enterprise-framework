import { SamplePage } from "@pages/admin/SamplePage";
import {test as baseTest} from "@fixtures/BaseTest"

type AdminFixtures = {
    samplePage: SamplePage
}

export const test = baseTest.extend<AdminFixtures>({
    samplePage: async ({page}, use)=>{
        await use(new SamplePage(page));
    }
})





