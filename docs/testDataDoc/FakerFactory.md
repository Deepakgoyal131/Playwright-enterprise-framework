**Why overrides?**

This is extremely useful.

# You can generate:

const customer =
    FakerFactory.customer();

# But suppose the test specifically needs:

city = Indore

# You can do:

const customer =
    FakerFactory.customer({
        city: "Indore"
    });

# Everything else remains dynamic.

# This is a very useful enterprise pattern.