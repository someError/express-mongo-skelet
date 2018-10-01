const db = require('../db');
const util = require('../util');

exports.all = (req, callback) => {
 const { page, limit } = req.query;
 const pipeline = [
  { $sort: { "_id": -1 } },
  { $unwind: "$data" },
  { $group: { _id: '$id', mergedData: { $push: "$data" } } },
  { $project: { id: '$id', data: { $slice: [
   "$mergedData",
   0,
   100
  ]}}},
 ];
 // const filter = util.getAggregate(req, 'data', 'time', 100, [{$group: { _id: '$id', data: { $last: "$$ROOT" }}}]);
 const _page = Number(page) || 1;
 const _limit = Number(limit) && Number(limit) <= 100 ? Number(limit) : 10;
 const skip = _page === 1 ? 0 : (_page - 1) * limit;

 db.get().collection('gps').aggregate(pipeline).skip(skip).limit(_limit).toArray((err, docs) => {
  callback(err, docs)
 });
};

exports.findById = (id, callback) => {
 db.get().collection('gps').find({id}).sort({_id: -1}).toArray((err, docs) => {
  callback(err, docs)
 });
};

exports.findByQuery = (req, callback) => {
 const { gt, lt, limit, page } = req.query;
 const _limit = Number(limit) <= 2000 ? Number(limit) : 100;
 const skip = page && Number(page) > 1 ? (page * _limit) - 1 : 0;
 const cond = { $and: [{ $gt: [ "$$item.time", gt || 0 ]}] };

 if (lt) cond.$and.push({ $lt: ["$$item.time", lt] });

 const pipeline = [
  { $match: { id: req.params.id } },
  { $sort: { "_id": -1 } },
  { $unwind: "$data" },
  { $group: { _id: '$id', mergedData: { $push: "$data" } } },
  { $project: { id: '$id', data: { $slice: [
   {
    $filter: {
     input: `$mergedData`,
     as: 'item',
     cond
    }
   },
   skip,
   _limit
  ]}}},
 ];

 db.get().collection('gps').aggregate(pipeline).toArray((err, docs) => {
  callback(err, docs)
 })
};

exports.create = (user, callback) => {
 db.get().collection('gps').insert(user, (err, res) => {
  callback(err, res)
 })
};

exports.update = (_id, data, callback) => {
 db.get().collection('gps').update({_id}, data, (err, res) => {
  callback(err, res)
 })
};