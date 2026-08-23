# Test Data Guide

## Playwright Enterprise Automation Framework

This document explains how QA engineers should create, read, and use test data in automation tests. The goal is simple: separate test data from test logic so that tests remain readable, reusable, and easier to maintain.

The framework supports:

- JSON test data
- Excel test data
- CSV test data
- Single dataset usage
- Multiple test datasets
- Data-driven testing
- Strongly typed test data
- Centralized test data management

---

# 1. Why We Use a Test Data Layer

Test data should never be hardcoded inside test logic. Keeping data separate makes the suite easier to maintain and improves readability.

## ❌ Bad practice

```ts
test("Login Test", async ({ page }) => {
  await loginPage.login("admin", "admin123");
});
```

This mixes real test data directly with the automation logic, which is difficult to update and hard to reuse.

## ✅ Recommended approach

```ts
const login = TestDataManager.login("validAdmin");

test("Login Test", async ({ page }) => {
  await loginPage.login(login.username, login.password);
});
```

With this structure, the test uses a named dataset and the logic stays clean.

---

# 2. Supported Test Data Sources

The framework supports the following data sources:

- JSON
- Excel
- CSV

### High-level flow

```text
Test Data File
      ↓
Data Reader
      ↓
TestDataManager
      ↓
Test
```

### Example flow

```text
login.json
    ↓
JsonReader
    ↓
TestDataManager
    ↓
Login Test
```

---

# 3. Test Data Folder Structure

The recommended storage structure is:

```text
src/
└── test-data/
    ├── data/
    │   ├── json/
    │   │   ├── login.json
    │   │   ├── customer.json
    │   │   └── payment.json
    │   ├── excel/
    │   │   ├── login.xlsx
    │   │   └── customer.xlsx
    │   └── csv/
    │       ├── login.csv
    │       └── customer.csv
    ├── readers/
    │   ├── IDataReader.ts
    │   ├── IKeyedDataReader.ts
    │   ├── JsonReader.ts
    │   ├── ExcelReader.ts
    │   └── CsvReader.ts
    ├── managers/
    │   └── TestDataManager.ts
    ├── models/
    │   ├── LoginData.ts
    │   ├── CustomerData.ts
    │   └── PaymentData.ts
    └── helpers/
        └── DataDrivenHelper.ts
```

QA engineers usually work with:

- data/
- models/
- TestDataManager
- tests

In normal usage, you do not need to change the readers themselves.

---

# 4. Creating a Data Model

Every important business test-data structure should have a TypeScript model.

Example file:

```ts
// src/test-data/models/LoginData.ts
export interface LoginData {
  username: string;
  password: string;
}
```

This gives us:

- Type safety
- Autocomplete in editors
- Easier maintenance
- Fewer data-related mistakes

---

# 5. JSON Test Data

## 5.1 Create a JSON file

Path:

```text
src/test-data/data/json/login.json
```

Example:

```json
{
  "validAdmin": {
    "username": "admin",
    "password": "admin123"
  },
  "validUser": {
    "username": "testuser",
    "password": "Test@123"
  },
  "invalidUser": {
    "username": "wronguser",
    "password": "wrong123"
  }
}
```

Each key represents a test dataset.

---

# 6. Reading One Dataset from JSON

If you need one specific dataset, use:

```ts
const login = TestDataManager.login("validAdmin");
```

Now you can use:

```ts
login.username
login.password
```

### Example

```ts
import { test, expect } from "@playwright/test";
import { TestDataManager } from "@test-data";

test("Login with valid admin", async ({ page }) => {
  const login = TestDataManager.login("validAdmin");

  console.log(login.username);
  console.log(login.password);

  // await loginPage.login(login.username, login.password);

  expect(login.username).toBeTruthy();
});
```

---

# 7. Reading Multiple Datasets from JSON

Use:

```ts
const loginData = TestDataManager.allLoginData();
```

This returns an array of `LoginData` objects.

### Example

```ts
const loginData = TestDataManager.allLoginData();
console.log(loginData);
```

This is useful when you want to create one test for many scenarios.

---

# 8. JSON Data-Driven Testing

```ts
import { test, expect } from "@playwright/test";
import { TestDataManager, DataDrivenHelper } from "@test-data";

const loginData = TestDataManager.allLoginData();

DataDrivenHelper.assertNotEmpty(loginData, "login.json");

for (let index = 0; index < loginData.length; index++) {
  const data = loginData[index];

  test(
    DataDrivenHelper.testName(
      "Login Test",
      data,
      index,
      item => item.username
    ),
    async ({ page }) => {
      console.log(`Testing ${data.username}`);

      // await loginPage.login(data.username, data.password);

      expect(data.username).toBeTruthy();
    }
  );
}
```

This generates test names such as:

```text
Login Test - admin
Login Test - testuser
Login Test - wronguser
```

---

# 9. Excel Test Data

## 9.1 Excel location

Create a file like:

```text
src/test-data/data/excel/login.xlsx
```

The first row should contain the column names.

Example structure:

```text
key,username,password
validAdmin,admin,admin123
validUser,testuser,Test@123
invalidUser,wronguser,wrong123
```

---

# 10. Reading One Dataset from Excel

Use the Excel reader directly when you need a dataset from an Excel file.

```ts
import { ExcelReader, LoginData } from "@test-data";

const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");
const login = reader.get("validAdmin");
```

Now you can use:

```ts
login.username
login.password
```

### Example

```ts
test("Excel login test", async ({ page }) => {
  const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");
  const login = reader.get("validAdmin");

  console.log(login.username);

  // await loginPage.login(login.username, login.password);
});
```

---

# 11. Checking Whether Excel Data Exists

```ts
const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");

if (reader.exists("validAdmin")) {
  const login = reader.get("validAdmin");
}
```

This is useful when a test conditionally uses a dataset.

---

# 12. Reading All Excel Data

```ts
const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");
const loginData = reader.read();
```

The result is an array:

```ts
LoginData[]
```

---

# 13. Excel Data-Driven Testing

```ts
import { test, expect } from "@playwright/test";
import { ExcelReader, LoginData, DataDrivenHelper } from "@test-data";

const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");
const loginData = reader.read();

DataDrivenHelper.assertNotEmpty(loginData, "login.xlsx");

for (let index = 0; index < loginData.length; index++) {
  const login = loginData[index];

  test(
    DataDrivenHelper.testName(
      "Excel Login Test",
      login,
      index,
      item => item.username
    ),
    async ({ page }) => {
      console.log(`Testing ${login.username}`);

      // await loginPage.login(login.username, login.password);

      expect(login.username).toBeTruthy();
    }
  );
}
```

---

# 14. CSV Test Data

Create a file like:

```text
src/test-data/data/csv/login.csv
```

Example:

```csv
key,username,password
validAdmin,admin,admin123
validUser,testuser,Test@123
invalidUser,wronguser,wrong123
```

---

# 15. Reading One Dataset from CSV

```ts
import { CsvReader, LoginData } from "@test-data";

const reader = new CsvReader<LoginData>("login.csv");
const login = reader.get("validAdmin");
```

Then:

```ts
console.log(login.username);
console.log(login.password);
```

---

# 16. Reading All CSV Data

```ts
const reader = new CsvReader<LoginData>("login.csv");
const loginData = reader.read();
```

The result is:

```ts
LoginData[]
```

---

# 17. CSV Data-Driven Testing

```ts
import { test, expect } from "@playwright/test";
import { CsvReader, LoginData, DataDrivenHelper } from "@test-data";

const reader = new CsvReader<LoginData>("login.csv");
const loginData = reader.read();

DataDrivenHelper.assertNotEmpty(loginData, "login.csv");

for (let index = 0; index < loginData.length; index++) {
  const login = loginData[index];

  test(
    DataDrivenHelper.testName(
      "CSV Login Test",
      login,
      index,
      item => item.username
    ),
    async ({ page }) => {
      console.log(`Testing ${login.username}`);
      expect(login.username).toBeTruthy();
    }
  );
}
```

---

# 18. Which Method Should I Use?

| Requirement | Recommended approach |
| --- | --- |
| One JSON dataset | `TestDataManager.login("key")` |
| All JSON datasets | `TestDataManager.allLoginData()` |
| One Excel dataset | `ExcelReader.get("key")` |
| All Excel datasets | `ExcelReader.read()` |
| One CSV dataset | `CsvReader.get("key")` |
| All CSV datasets | `CsvReader.read()` |
| Same test with many datasets | Data-driven test |
| Dynamic/random data | `TestDataFactory` |

---

# 19. Recommended Approach for QA Engineers

### Prefer `TestDataManager` for business test data

```ts
const login = TestDataManager.login("validAdmin");
```

Instead of:

```ts
const reader = new JsonReader<LoginData>("login.json");
const login = reader.get("validAdmin");
```

Why?

Because `TestDataManager` hides the implementation details. The test does not care whether the data comes from:

- JSON
- Excel
- CSV
- Database
- API

The test only asks for the required business data.

---

# 20. When Should I Use the Reader Directly?

Direct reader usage is acceptable when:

- Creating a new data source
- Testing the reader itself
- Using a temporary Excel or CSV dataset
- A dataset is not yet exposed by `TestDataManager`

### Example

```ts
const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");
```

For normal reusable business data, prefer:

```ts
TestDataManager
```

---

# 21. Data-Driven Testing vs Single Dataset

## Single dataset

Use this when you want to test one specific scenario.

```ts
const login = TestDataManager.login("validAdmin");

test("Admin login", async ({ page }) => {
  // Login with admin
});
```

## Multiple datasets

Use this when the same test flow should run against many input combinations.

Examples:

- validAdmin
- validUser
- invalidUser
- lockedUser
- expiredUser

Instead of writing five separate tests, create one template and reuse it with different data.

---

# 22. Data-Driven Test Naming

Always generate meaningful test names.

## ❌ Bad

```ts
test("Login Test", async ({ page }) => {
  // same name repeated for many datasets
});
```

This creates duplicate test names in the report.

## ✅ Good

```ts
DataDrivenHelper.testName(
  "Login Test",
  data,
  index,
  item => item.username
);
```

Result:

```text
Login Test - admin
Login Test - testuser
Login Test - wronguser
```

This makes reports much easier to read and understand.

---

# 23. DataDrivenHelper

The helper is generic. It does not know about specific domains like:

- `LoginData`
- `CustomerData`
- `PaymentData`
- JSON
- Excel
- CSV

It works with any generic data model.

### Example

```ts
DataDrivenHelper.execute(data, async ({ data, index, total }) => {
  console.log(`${index + 1}/${total}`);
  console.log(data);
});
```

---

# 24. Generic Data Example

```ts
interface EmployeeData {
  employeeId: string;
  name: string;
  department: string;
}

const employees: EmployeeData[] = [
  {
    employeeId: "EMP001",
    name: "John",
    department: "QA"
  },
  {
    employeeId: "EMP002",
    name: "David",
    department: "Development"
  }
];
```

Then:

```ts
DataDrivenHelper.testName(
  "Employee Test",
  employees[0],
  0,
  item => item.employeeId
);
```

The helper does not need to know anything about the data structure.

---

# 25. Important Rule: Do Not Hardcode Data in Tests

## ❌ Bad

```ts
await loginPage.login("admin", "admin123");
```

## ✅ Good

```ts
const login = TestDataManager.login("validAdmin");

await loginPage.login(login.username, login.password);
```

---

# 26. Do Not Read Files Directly in Tests

## ❌ Bad

```ts
fs.readFileSync("login.json", "utf-8");
```

```ts
XLSX.readFile("login.xlsx");
```

```ts
parse(csvContent);
```

Tests should not know how the files are read.

## ✅ Preferred

```ts
TestDataManager.login("validAdmin");
```

Or:

```ts
const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");
```

---

# 27. Data Naming Standards

Use descriptive dataset names.

## ✅ Good

```text
validAdmin
validUser
invalidPassword
lockedUser
expiredUser
emptyUsername
specialCharacters
```

## ❌ Avoid

```text
data1
data2
test1
abc
newData
xyz
```

---

# 28. Data Model Naming

Use names like:

```text
LoginData.ts
CustomerData.ts
PaymentData.ts
EmployeeData.ts
OrderData.ts
```

Avoid names like:

```text
LoginModel1.ts
Data.ts
TestData.ts
TempData.ts
```

---

# 29. Sensitive Data

Never store real credentials in:

- JSON
- Excel
- CSV
- Git repositories

Do not commit:

- Production passwords
- API secrets
- Credit card information
- Authentication tokens
- Private keys

Use environment variables or secure secrets management where required.

---

# 30. Choosing JSON vs Excel vs CSV

## JSON

Recommended for:

- Small to medium datasets
- API test data
- Configuration-like data
- Structured nested data

Example:

```json
{
  "validUser": {
    "username": "admin",
    "password": "admin123"
  }
}
```

## Excel

Recommended for:

- Large QA datasets
- Business-managed test data
- Data maintained by non-developers
- Multiple columns
- Multiple worksheets

Example:

```text
login.xlsx
├── sheet1
├── negativeTests
└── boundaryTests
```

## CSV

Recommended for:

- Simple tabular data
- Large flat datasets
- Easy data exchange
- Lightweight test data

---

# 31. Recommended Architecture

The preferred architecture is:

```text
                    TEST
                     │
                     ▼
              TestDataManager
                     │
          ┌──────────┼──────────┐
          │          │          │
         JSON      Excel       CSV
          │          │          │
       JsonReader ExcelReader CsvReader
          │          │          │
          └──────────┼──────────┘
                     │
                     ▼
                 Data Model
                     │
                     ▼
                    Test
```

For data-driven execution:

```text
                 Test Data
                     │
                     ▼
                    T[]
                     │
                     ▼
             DataDrivenHelper
                     │
            ┌────────┼────────┐
            ▼        ▼        ▼
          Test 1   Test 2   Test 3
```

---

# 32. Quick Reference

## One JSON dataset

```ts
const data = TestDataManager.login("validAdmin");
```

## All JSON datasets

```ts
const data = TestDataManager.allLoginData();
```

## One Excel dataset

```ts
const reader = new ExcelReader<LoginData>("login.xlsx", "sheet1");
const data = reader.get("validAdmin");
```

## All Excel datasets

```ts
const data = reader.read();
```

## One CSV dataset

```ts
const reader = new CsvReader<LoginData>("login.csv");
const data = reader.get("validAdmin");
```

## All CSV datasets

```ts
const data = reader.read();
```

## Generate a data-driven test name

```ts
DataDrivenHelper.testName(
  "Login Test",
  data,
  index,
  item => item.username
);
```

---

# 33. QA Best Practices

1. Keep test data outside test logic.
2. Use TypeScript interfaces for test data.
3. Use meaningful dataset names.
4. Prefer `TestDataManager` for reusable application data.
5. Use data-driven testing when the same flow is repeated with different data.
6. Do not duplicate test logic for different datasets.
7. Do not read files directly from test files.
8. Do not store production secrets in test-data files.
9. Keep Excel and CSV columns consistent with their TypeScript model.
10. Keep datasets small and focused when possible.
11. Validate that datasets are not empty.
12. Use meaningful test names for data-driven tests.
13. Do not modify framework readers just to support a single test.
14. Add new models when introducing a new business data structure.
15. Keep test data maintainable by the QA team.

---

# 34. Common Mistakes

## Mistake 1: Wrong Excel column names

Model:

```ts
interface LoginData {
  username: string;
  password: string;
}
```

Excel data:

```text
UserName
Password123
```

This does not match the expected structure. Use:

```text
username
password
```

## Mistake 2: Empty dataset

If a spreadsheet contains no records, no useful tests will be generated.

Use:

```ts
DataDrivenHelper.assertNotEmpty(data, "login.xlsx");
```

## Mistake 3: Duplicate test names

Avoid:

```ts
test("Login Test", async ({ page }) => {
  // repeated for every dataset
});
```

Use:

```ts
DataDrivenHelper.testName(...)
```

## Mistake 4: Hardcoding data

Avoid:

```ts
const username = "admin";
```

Use:

```ts
const login = TestDataManager.login("validAdmin");
```

---

# 35. Final Rule

When writing a new test, ask this question:

> Does this test need one dataset or multiple datasets?

## If it needs one dataset

```ts
const data = TestDataManager.login("validAdmin");
```

## If it needs multiple datasets

```ts
const data = TestDataManager.allLoginData();
```

Then create a data-driven test.

---

# 36. Summary

The framework makes it easy to separate test data from logic.

### For reusable business data

```text
Test
 ↓
TestDataManager
 ↓
Reader
 ↓
JSON / Excel / CSV
```

### For data-driven testing

```text
Data Source
 ↓
Reader
 ↓
T[]
 ↓
DataDrivenHelper
 ↓
Multiple Playwright Tests
```

### Remember

```text
One dataset  → get("key")
Multiple datasets → read() / allData()
Reusable business data → TestDataManager
Same test with different data → DataDrivenHelper
```

---

# End of Test Data Guide

This framework provides a clear, maintainable way to manage test data while keeping automation tests clean, scalable, and easy to understand.
