**The Golden Rules**

# Rule 1

❌ Never read JSON directly in a test.

fs.readFileSync(...)

Not allowed.

# Rule 2

❌ Never instantiate a reader inside a test.

new JsonReader(...)

Not allowed.

# Rule 3

✅ Use:

TestDataManager.login("admin");
# Rule 4

For dynamic data:

TestDataFactory.customer();
# Rule 5

For controlled dynamic data:

TestDataFactory.customer({
    city: "Indore"
});

# Rule 6

Models must be strongly typed.

Avoid:

any

for test data.