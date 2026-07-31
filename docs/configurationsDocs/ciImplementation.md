**Should CI be in .env.qa?**

    No.
    Just like FRAMEWORK_ENV, CI should not be stored in your .env files.

    Reason:
    .env.qa describes the application under test.
    CI describes the machine executing the tests.

    They are different concerns.