const Gps = require('../models/gps-coordinates');

exports.all = (req, res) => {
 Gps.all(req, (err, docs) => {
  if (err) {
   console.log(err);
   return res.sendStatus(500);
  }
  res.send(docs);
 })
};

exports.getById = (req, res) => {
 Gps.findByQuery(req, (err, docs) => {
  if (err) {
   console.log(err);
   return res.sendStatus(500);
  }

  if (!docs.length) return res.sendStatus(404);

  res.send(docs)
 })
};

exports.update = (req, res) => {
 const id = req.headers['device-id'];
 if (!id) return res.sendStatus(401);
 if (typeof req.body !== "object" || req.body[0]) return res.status(400).send('request body must be object');
 if (!req.body.time) return res.status(400).send('time field is required');
 if (!req.body.lat) return res.status(400).send('lat field is required');
 if (!req.body.lon) return res.status(400).send('lon field is required');

 const data = [req.body];

 Gps.findById(id, (err, docs) => {

  if (err) {
   console.log(err);
   return res.sendStatus(500);
  }

  if (!docs[0] || docs[0].data.length === 500) {
   Gps.create({id, data: data}, (err, result) => {
    if (err) {
     console.log(err);
     return res.sendStatus(500);
    }
    return res.sendStatus(200);
   })
  } else {
   const _id = docs[0]._id;

   Gps.update(_id, {$push: {data: {$each: data, $position: 0}}}, (err, result) => {
    if (err) {
     console.log(err);
     return res.sendStatus(500);
    }
    return res.sendStatus(200);
   })
  }

 })
};