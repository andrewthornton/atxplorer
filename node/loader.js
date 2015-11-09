'use strict';

var request = require('request');
var d3 = require('d3');
var csv = require('csv');
var elasticsearch = require('elasticsearch');
var WritableBulk = require('elasticsearch-streams').WritableBulk;
var TransformToBulk = require('elasticsearch-streams').TransformToBulk;
var mappings = require('./mapping');
console.log('test')
var columns = [
  'number',
  'code',
  'description',
  'owning_department',
  'report_method',
  'status',
  'status_changed_date',
  'created_date',
  'last_updated_date',
  'closed_date',
  'location',
  'street_number',
  'street_name',
  'city',
  'zip',
  'county',
  'x_coordinate',
  'y_coordinate',
  'latitude',
  'longitude',
  'location',
  'district',
  'map_page',
  'map_tile'
];

var client = new elasticsearch.Client({
  host: 'elasticsearch:9200',
});

var ws = new WritableBulk(bulkExec);
var toBulk = new TransformToBulk(function (doc) { return { _id: doc.number }; });
var parser = csv.parse({columns:columns, trim:true, relax:true});

function bulkExec (bulkCmds, callback) {
  client.bulk({
    index : 'data',
    type  : 'requests',
    body  : bulkCmds
  }, callback);
}
var parse = d3.time.format('%m/%d/%Y %I:%M:%S %p').parse;

var transform = csv.transform(function (row) {
  row.location = [+row.longitude || 0 ,+row.latitude || 0];
  delete row.latitude;
  delete row.longitude;
  delete row.map_tile;
  delete row.map_page;
  delete row.x_coordinate;
  delete row.y_coordinate;
  row.zip = +row.zip;
  row.street_number = +row.street_number;
  row.district = +row.district;
  row.status_changed_date = parse(row.status_changed_date);
  row.created_date = parse(row.created_date);
  row.last_updated_date = parse(row.last_updated_date);
  row.closed_date = parse(row.closed_date);
  row.description_not_analyzed = row.description;
  return row;
});

function createIndex () {
  return client.indices.create({
    index: 'data',
    body: {
      mappings: mappings
    }
  });
}

client.indices.delete({index:'data'})
  .then(() => createIndex(), () => createIndex())
  .then(() => {
    request.get('https://data.austintexas.gov/api/views/i26j-ai4z/rows.csv?accessType=DOWNLOAD')
      .pipe(parser).pipe(transform).pipe(toBulk).pipe(ws)
      .on('finish', () => console.log('done!'))
      .on('error', (err) => console.log(err));
  });


