**Our Playwright Config Should Have Only Three Responsibilities**
1. Initialize Environment

2. Read Framework Configuration

3. Pass Configuration to Playwright

npm run test:qa

        │

        ▼

FRAMEWORK_ENV=qa

        │

        ▼

Environment.initialize()

        │

        ▼

Read .env.qa

        │

        ▼

Read FrameworkConfig

        │

        ▼

Build Playwright Config

        │

        ▼

Launch Browser