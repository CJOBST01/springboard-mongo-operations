# Springboard MongoDB Operations

MongoDB Operations exercise from Unit 17.4: NoSQL Databases.

Works against the standard `sample_mflix` dataset on MongoDB Atlas. Two
parallel implementations are provided:

- `operations.js` — Node.js script using the official `mongodb` driver.
- `queries.mongosh.js` — equivalent commands written for the `mongosh` shell
  or MongoDB Compass `_MongoSH` tab.

## Setup

```bash
npm install
MONGO_URI='mongodb+srv://USER:PASSWORD@CLUSTER/' node operations.js
```

The script reads the connection string from the `MONGO_URI` environment
variable. If unset, it falls back to `mongodb://127.0.0.1:27017`.

## Coverage

Every task from the project brief is implemented:

- Create — insert a user document.
- Read — six queries against the `movies` collection.
- Update — four updates against `movies`.
- Delete — three deletes across `comments` and `movies`.
- Aggregate — counts per release year and average IMDb rating per director.
