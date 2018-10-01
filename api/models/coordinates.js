const db = require('../db');

exports.all = (filter, query, callback) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) && Number(query.limit) <= 100 ? Number(query.limit) : 10;
  const skip = page === 1 ? 0 : (page - 1) * limit;
  db.get().collection('coordinates').aggregate(filter).skip(skip).limit(limit).toArray((err, docs) => {
    callback(err, docs)
  });
};

exports.findById = (id, callback) => {
  db.get().collection('coordinates').find({id}).toArray((err, docs) => {
    callback(err, docs)
  });
};

exports.findByQuery = (filter, query, callback) => {
  const page = Number(query.page) || 1;
  db.get().collection('coordinates').aggregate(filter).skip(page - 1).limit(page).toArray((err, docs) => {
    callback(err, docs)
  })
};

exports.create = (user, callback) => {
  db.get().collection('coordinates').insert(user, (err, res) => {
    callback(err, res)
  })
};

// exports.update = (id, data, callback) => {
//   db.get().collection('coordinates')
//     .update({ id }, data, (err, res) => {
//       callback(err, res)
//     }
//   )
// };