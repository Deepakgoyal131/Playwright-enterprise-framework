** Visual work flow for ENV **
package.json
│
▼
FRAMEWORK_ENV=qa
│
▼
Environment.ts
│
▼
configs/env/.env.qa
│
▼
BASE_URL
API_URL
USERNAME
PASSWORD
HEADLESS

**Structure: **
configs/
└── env/
├── .env.dev
├── .env.qa
├── .env.uat
└── .env.prod

** How to run test with load different env **

1. For run test with .env.qa file -->> npm run test:qa
2. For run test with .env.dev file -->> npm run test:dev
3. For run test with .env.uat file -->> npm run test:uat

.env.dev → Stores Dev configuration.
.env.qa → Stores QA configuration.
.env.uat → Stores UAT configuration.
.env.prod → Stores Production configuration.
FRAMEWORK_ENV → Only tells the framework which file to load.

## API Testing Configuration

The API fixture creates a Playwright request context using `API_URL`; it does not use the browser `BASE_URL`. The current `Environment.initialize()` validator requires `BASE_URL`, `API_URL`, `USERNAME`, `PASSWORD`, and `HEADLESS` for every configured environment. Ensure the selected `.env` file defines all five values before running tests. The checked-in `.env.dev` and `.env.uat` files are currently incomplete, so those environments need owner-provided configuration before use. Do not commit credentials or tokens, and verify production endpoints before running any tests that can change data.

See [API Fixture](../ApiDocs/APIFixture.md) for request context lifecycle and usage.
