var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var loader = require('../loader');

var client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/search', (req, res) =>{
  client.search({
    index: 'data',
    type: 'requests',
    size: 1000,
    body: req.body
  }).then(results => res.send(results), error => res.send(error));
});

router.get('/load', loader);

module.exports = router;
