
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
1. For run test with .env.qa file -->>  npm run test:qa
2. For run test with .env.dev file -->>  npm run test:dev
3. For run test with .env.uat file -->>  npm run test:uat


.env.dev → Stores Dev configuration.
.env.qa → Stores QA configuration.
.env.uat → Stores UAT configuration.
.env.prod → Stores Production configuration.
FRAMEWORK_ENV → Only tells the framework which file to load.