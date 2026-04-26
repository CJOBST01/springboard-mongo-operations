// queries.mongosh.js
// Same operations as operations.js, written for the mongosh shell or Compass
// MongoSH tab. Run after `use sample_mflix`.

use('sample_mflix');

// Create
db.users.insertOne({
  name: 'Christopher Jobst',
  email: 'christopher@example.com',
  password: '<placeholder>'
});

// Read
db.movies.find({ directors: 'Christopher Nolan' }, { title: 1, year: 1 });

db.movies.find({ genres: 'Action' }, { title: 1, year: 1 }).sort({ year: -1 });

db.movies.find(
  { 'imdb.rating': { $gt: 8 } },
  { _id: 0, title: 1, imdb: 1 }
);

db.movies.find({ cast: { $all: ['Tom Hanks', 'Tim Allen'] } });

db.movies.find({
  cast: { $all: ['Tom Hanks', 'Tim Allen'], $size: 2 }
});

db.movies.find({ genres: 'Comedy', directors: 'Steven Spielberg' });

// Update
db.movies.updateOne(
  { title: 'The Matrix' },
  { $set: { available_on: 'Sflix' } }
);

db.movies.updateOne(
  { title: 'The Matrix' },
  { $inc: { metacritic: 1 } }
);

db.movies.updateMany(
  { year: 1997 },
  { $addToSet: { genres: 'Gen Z' } }
);

db.movies.updateMany(
  { 'imdb.rating': { $lt: 5 } },
  { $inc: { 'imdb.rating': 1 } }
);

// Delete
// Replace COMMENT_OBJECTID below with an actual _id when running interactively.
db.comments.deleteOne({ _id: ObjectId('REPLACE_WITH_REAL_OBJECTID') });

const matrix = db.movies.findOne({ title: 'The Matrix' });
if (matrix) {
  db.comments.deleteMany({ movie_id: matrix._id });
}

db.movies.deleteMany({
  $or: [
    { genres: { $exists: false } },
    { genres: { $size: 0 } }
  ]
});

// Aggregate
db.movies.aggregate([
  { $match: { year: { $type: 'number' } } },
  { $group: { _id: '$year', count: { $sum: 1 } } },
  { $sort: { _id: 1 } }
]);

db.movies.aggregate([
  { $unwind: '$directors' },
  { $match: { 'imdb.rating': { $type: 'number' } } },
  {
    $group: {
      _id: '$directors',
      avg_rating: { $avg: '$imdb.rating' },
      count: { $sum: 1 }
    }
  },
  { $sort: { avg_rating: -1 } }
]);
