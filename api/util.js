const zlib = require('zlib')

const createCoordinatesObj =  ([time, x, y, z]) => {
  return { time: Number(time), x, y, z }
};

exports.createCoordinatesObj = createCoordinatesObj;

exports.createCoordinatesData = (data) => {
  let _data = '';

  data.map(bufferItem => {
    _data += bufferItem;
  });

  const dataParsed = _data.split('\n');

  if(dataParsed[dataParsed.length - 1] === '') dataParsed.splice(dataParsed.length - 1, 1);

  let lines = [];

  for (let i = 0; i < dataParsed.length; i++) {
    const fields = dataParsed[i].split(';');

    if (fields && (fields.length !== 5)) {
      lines = `parse error on ${i + 1} line`;
      break;
    }

    lines.push(createCoordinatesObj(fields))
  }
  return lines;
};

exports.unCompress = (req, callback) => {
  //TODO: добавить проверку на тип кодирования, если потребуется
  const gUnzip = zlib.createGunzip();
  req.pipe(gUnzip);
  const buffer = [];

  gUnzip.on('data', function(data) {
    buffer.push(data.toString())

  }).on("end", function() {
    callback(null, buffer)

  }).on("error", function(err) {
    console.log(err);
    callback(err)
  });
};

exports.compress = (data) => {
  return new Promise((resolve, reject) => {
    if (typeof data === 'object') {
      data = new Buffer(JSON.stringify(data), 'utf-8');
    }

    zlib.gzip(data, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

exports.getAggregate = (req, object, field, limit, additionally) => {
  const lt = req.query.lt && Number(req.query.lt);
  const gt = req.query.gt && Number(req.query.gt);
  const _limit = Number(limit) || 1000000;
  const query = [];
  const cond = {};
  cond.$and = [];

  if (req.params.id) query.push({$match: {id: req.params.id}});
  if (lt) cond.$and.push({$lt: [`$$item.${field}`, lt]});
  if (gt) cond.$and.push({$gt: [`$$item.${field}`, gt]});

  query.push({ $project: {
    id: '$id',
    [object]: {
      $slice: [
        {
          $filter: {
            input: `$${object}`,
            as: 'item',
            cond
          }
        },
        -_limit
      ],
    }
  }});

  if (additionally && Array.isArray(additionally)) additionally.map(params => {
    query.push(params);
  });

  return query;
};