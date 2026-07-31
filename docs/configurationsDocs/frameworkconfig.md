Architecture
                Framework

                   │

      ┌────────────┴─────────────┐

      ▼                          ▼

Environment.ts             FrameworkConfig.ts

      │                          │

Reads .env                 Stores Framework Rules

------------------------------------------------
Responsibility of FrameworkConfig.ts

Framework Configuration
        │
        ▼
FrameworkConfig.ts
        │
        ▼
Timeouts
Retries
Workers
Reporters
Artifacts
Browser

**Browser**
| Property     | Value        | Reason                                      |
| ------------ | ------------ | ------------------------------------------- |
| Browser      | Chromium     | Fastest and most stable                     |
| Viewport     | 1920 × 1080  | Standard desktop resolution                 |
| Ignore HTTPS | true         | QA/UAT often use self-signed certificates   |
| Locale       | en-IN        | Suitable for Indian enterprise applications |
| Timezone     | Asia/Kolkata | Matches your application users              |

**Timeout**
| Timeout    | Value  | Reason                |
| ---------- | ------ | --------------------- |
| Test       | 2 min  | Entire test execution |
| Action     | 15 sec | click(), fill(), etc. |
| Navigation | 30 sec | Page loads            |
| Expect     | 10 sec | Assertions            |

**Retries**
| Environment | Value |
| ----------- | ----- |
| Local       | 0     |
| CI          | 2     |

**Artifacts**
| Feature    | Value             |
| ---------- | ----------------- |
| Screenshot | only-on-failure   |
| Video      | retain-on-failure |
| Trace      | on-first-retry    |
