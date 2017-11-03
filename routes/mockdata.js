var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/time_entries', function(req, res, next) {

  res.json(require('../mockdata/time_entries.json'));
  // res.render('index', { title: 'Express' });
});

module.exports = router;
