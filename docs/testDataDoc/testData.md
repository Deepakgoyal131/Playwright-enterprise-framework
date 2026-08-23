IDataReader
      │
      ▼
JsonReader
      │
      ▼
TestDataManager
      │
      ▼
Typed Models
      │
      ▼
ExcelReader
      │
      ▼
CSVReader
      │
      ▼
FakerFactory

**Why This Manager Design?**

Now your test does:

# const login =
    TestDataManager.login("admin");

It does not do:

# new JsonReader<LoginData>("login.json");

This is extremely important.

# Your test knows:

"I need login data."

# It doesn't know:

"I need login.json."

That's proper abstraction.

#                       **TEST** 
                           │
                           ▼
                  TestDataManager
                           │
            ┌──────────────┼──────────────┐
            │              │              │
         Login          Customer       Payment
            │              │              │
            ▼              ▼              ▼
        JsonReader      JsonReader      JsonReader
            │              │              │
            ▼              ▼              ▼
        login.json     customer.json   payment.json


                 DYNAMIC DATA
                       │
                       ▼
                TestDataFactory
                       │
                       ▼
                 FakerFactory
                       │
                       ▼
                    Faker