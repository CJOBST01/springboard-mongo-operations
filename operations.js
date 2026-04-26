// operations.js
// MongoDB Operations exercise (Unit 17.4) against the sample_mflix dataset.
//
// Run with:
//   MONGO_URI='mongodb+srv://USER:PASSWORD@CLUSTER/' node operations.js

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function main() {
  await client.connect();
  const db = client.db('sample_mflix');
  const movies = db.collection('movies');
  const users = db.collection('users');
  const comments = db.collection('comments');

  // ---- Create ----

  // 1. Insert a new user document with name and email.
  const newUser = await users.insertOne({
    name: 'Christopher Jobst',
    email: 'christopher@example.com',
    password: '<placeholder>'
  });
  console.log('Inserted user id:', newUser.insertedId);

  // ---- Read ----

  // 2. Movies directed by Christopher Nolan.
  const nolanMovies = await movies
    .find({ directors: 'Christopher Nolan' })
    .project({ title: 1, year: 1 })
    .toArray();
  console.log('Nolan movies:', nolanMovies.length);

  // 3. Action movies sorted by year descending.
  const actionByYear = await movies
    .find({ genres: 'Action' })
    .sort({ year: -1 })
    .project({ title: 1, year: 1, genres: 1 })
    .toArray();
  console.log('Action movies sorted desc:', actionByYear.length);

  // 4. Movies with IMDb rating > 8 (title and imdb only).
  const highRated = await movies
    .find({ 'imdb.rating': { $gt: 8 } })
    .project({ _id: 0, title: 1, imdb: 1 })
    .toArray();
  console.log('High-rated movies:', highRated.length);

  // 5. Movies starring both Tom Hanks and Tim Allen.
  const hanksAndAllen = await movies
    .find({ cast: { $all: ['Tom Hanks', 'Tim Allen'] } })
    .project({ title: 1, cast: 1 })
    .toArray();
  console.log('Hanks & Allen:', hanksAndAllen.length);

  // 6. Movies with cast === [Tom Hanks, Tim Allen] only (any order).
  const onlyHanksAndAllen = await movies
    .find({
      cast: {
        $all: ['Tom Hanks', 'Tim Allen'],
        $size: 2
      }
    })
    .project({ title: 1, cast: 1 })
    .toArray();
  console.log('Only Hanks & Allen:', onlyHanksAndAllen.length);

  // 7. Comedy movies directed by Steven Spielberg.
  const spielbergComedies = await movies
    .find({ genres: 'Comedy', directors: 'Steven Spielberg' })
    .project({ title: 1, year: 1 })
    .toArray();
  console.log('Spielberg comedies:', spielbergComedies.length);

  // ---- Update ----

  // 8. Add available_on: 'Sflix' to The Matrix.
  const matrixAvailable = await movies.updateOne(
    { title: 'The Matrix' },
    { $set: { available_on: 'Sflix' } }
  );
  console.log('Matrix available_on update:', matrixAvailable.modifiedCount);

  // 9. Increment metacritic of The Matrix by 1.
  const matrixInc = await movies.updateOne(
    { title: 'The Matrix' },
    { $inc: { metacritic: 1 } }
  );
  console.log('Matrix metacritic inc:', matrixInc.modifiedCount);

  // 10. Add genre 'Gen Z' to all movies released in 1997.
  const genZ = await movies.updateMany(
    { year: 1997 },
    { $addToSet: { genres: 'Gen Z' } }
  );
  console.log('Gen Z added to 1997 movies:', genZ.modifiedCount);

  // 11. Increase IMDb rating by 1 for all movies with rating < 5.
  const lowBoost = await movies.updateMany(
    { 'imdb.rating': { $lt: 5 } },
    { $inc: { 'imdb.rating': 1 } }
  );
  console.log('Low-rated boosted:', lowBoost.modifiedCount);

  // ---- Delete ----

  // 12. Delete a comment with a specific ID. Look one up first to demo the call.
  const oneComment = await comments.findOne({});
  if (oneComment) {
    const delById = await comments.deleteOne({ _id: oneComment._id });
    console.log('Deleted comment by id:', delById.deletedCount);
  }

  // 13. Delete all comments made for The Matrix.
  const matrix = await movies.findOne({ title: 'The Matrix' });
  if (matrix) {
    const matrixComments = await comments.deleteMany({ movie_id: matrix._id });
    console.log('Deleted Matrix comments:', matrixComments.deletedCount);
  }

  // 14. Delete movies that have no genres (missing or empty array).
  const noGenres = await movies.deleteMany({
    $or: [
      { genres: { $exists: false } },
      { genres: { $size: 0 } }
    ]
  });
  console.log('Deleted movies without genres:', noGenres.deletedCount);

  // ---- Aggregate ----

  // 15. Movies released per year, earliest to latest.
  const perYear = await movies.aggregate([
    { $match: { year: { $type: 'number' } } },
    { $group: { _id: '$year', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray();
  console.log('Years grouped:', perYear.length);

  // 16. Average IMDb rating per director, highest to lowest.
  const avgByDirector = await movies.aggregate([
    { $unwind: '$directors' },
    { $match: { 'imdb.rating': { $type: 'number' } } },
    { $group: { _id: '$directors', avg_rating: { $avg: '$imdb.rating' }, count: { $sum: 1 } } },
    { $sort: { avg_rating: -1 } }
  ]).toArray();
  console.log('Directors ranked by avg rating:', avgByDirector.length);
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.close());
