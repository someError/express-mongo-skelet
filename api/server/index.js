const express = require('express');
const bodyParser = require('body-parser');
const db = require('../db');
const coordinatesController = require('../controllers/coordinates');
const activityController = require('../controllers/activity');
const gpsController = require('../controllers/gps-coordinates');
const cors = require('cors');
const compression = require('compression');

const router = express.Router();
const app = express();

const jsonParser = bodyParser.json({ limit: '50mb' });
const textParser = bodyParser.text({ limit: '50mb' });

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

//coordinates
router.route('/coordinates')
    .get(compression(), coordinatesController.all)
    .post(textParser, coordinatesController.create);

router.route('/coordinates/:id')
    .get(compression(), coordinatesController.getById);

//activity
router.route('/activity')
    .get(compression(), activityController.all)
    .post(jsonParser, activityController.update);

router.route('/activity/:id')
    .get(compression(), activityController.getById);

//gps
router.route('/gps')
  .get(compression(), gpsController.all)
  .post(jsonParser, gpsController.update);

router.route('/gps/:id')
  .get(compression(), gpsController.getById);


app.get('/remove/:collection', (req, res) => {
  db.get().collection(req.params.collection).remove({}, (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send(err)
    }
    return res.sendStatus(200)
  })
});

app.use('/', router);


db.connect(process.env.NODE_ENV === 'production' ? 'mongodb://root:pass@mongo:27017' : 'mongodb://127.0.0.1:27017', (err) => {
  if(err) {
    return console.log(err)
  }

  app.listen(process.env.NODE_ENV === 'production' ? 3000 : 3001, function () {
    console.log('server started')
  });
});