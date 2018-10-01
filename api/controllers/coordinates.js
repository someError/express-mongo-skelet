const Coordinates = require('../models/coordinates');
const util = require('../util');
const zlib = require('zlib')

exports.all = (req, res) => {
  const filter = util.getAggregate(req, 'data', 'time', 1000, [{$group: { _id: '$id', data: { $last: "$$ROOT" }}}]);
  Coordinates.all(filter, req.query, (err, docs) => {
    if (err) {
      console.log(err);
      return res.send({status: 500, err});
    }

    const _docs = docs.map(doc => {
      return ({
        id: doc._id,
        data: doc.data.data
      })
    });

    if (req.query['encode'] !== undefined) {
      util.compress(_docs)
          .then(data => { return res.send({status: 200, data}) })
          .catch(err => { return res.send({status: 500, err}) });
    } else {
      return res.send({status: 200, _docs})
    }
  })
};

exports.getById = (req, res) => {
  const filter = util.getAggregate(req, 'data', 'time');
  Coordinates.findByQuery(filter, req.query, (err, docs) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    if (!docs.length) return res.sendStatus(404);

    if (req.query['encode'] !== undefined) {
      util.compress(docs)
          .then(data => { return res.send({status: 200, data}) })
          .catch(err => { return res.send({status: 500, err}) });
    } else {
      return res.send({status: 200, docs})
    }
  })
};

exports.create = (req, res) => {
  const id = req.headers['device-id'];
  if (!id) return res.sendStatus(401);

  util.unCompress(req, (err, buffer) => {
    if (err) return res.status(500).send(err);
    const data = util.createCoordinatesData(buffer, res);

    //error description
    if (typeof data === 'string') return res.status(400).send(data);

    const user = { id, data };

    Coordinates.create(user, (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500).send(err);
      }
      return res.sendStatus(200);
    })
  });
};