
**Data-Driven Playwright Test**

**Example JSON Data-Driven Test**
 - login.json
{
    "validAdmin": {
        "username": "admin",
        "password": "admin123"
    },
    "validUser": {
        "username": "testuser",
        "password": "Test@123"
    }
}

- test 
const loginData =
    TestDataManager.allLoginData();

for (
    let index = 0;
    index < loginData.length;
    index++
) {

    const data =
        loginData[index];

    test(
        DataDrivenHelper.testName(
            "Login Test",
            data,
            index,
            item => item.username
        ),

        async ({ page }) => {

            // Test implementation

            console.log(
                data.username
            );

        }
    );


**Excel Data-Driven Test** 

key	username	password	expectedResult
validAdmin	admin	admin123	success
validUser	testuser	Test@123	success
invalidUser	wronguser	wrong123	failure


const reader =
    new ExcelReader<LoginData>(
        "login.xlsx",
        "Sheet1"
    );

const data =
    reader.read();

for (
    let index = 0;
    index < data.length;
    index++
) {

    const login =
        data[index];

    test(
        `Login - ${login.username}`,
        async ({ page }) => {

            console.log(
                `Executing login for ${login.username}`
            );

            console.log(
                `Password: ${login.password}`
            );

            // Later:
            // const loginPage = new LoginPage(page);
            // await loginPage.login(
            //     login.username,
            //     login.password
            // );

        }
    );
}