'use strict';

angular.module('atxplorer.services', [])

.factory('atxSearch', function ($http) {
  var service = {};

  service.search = function (search) {
    var q = new ESQ();
    if(search.description)
      q.query('query', 'filtered', 'filter', ['and'], 'term', {description_not_analyzed: search.description});
    if(search.street)
      q.query('query', 'filtered', 'query', 'bool', ['must'],'match', {street_name: search.street});
    if(search.zip)
      q.query('query', 'filtered', 'filter', ['and'], 'term', {zip: search.zip});
    if(search.district)
      q.query('query', 'filtered', 'filter', ['and'], 'term', {district: search.district});
    if(search.status)
      q.query('query', 'filtered', 'filter', ['and'], 'term', {'status' : search.status});

    q.query('aggs', 'day', 'date_histogram', {field: 'created_date', interval: 'day'});
    q.query('aggs', 'descriptions', 'terms', {field: 'description_not_analyzed', size: 10000});

    q.query('sort', 'created_date', {'order': 'desc'});

    return $http.post('/search', q.getQuery()).then(function (data) {
      return data.data;
    });
  };

  service.dropdowns = function () {
    var q = new ESQ();
    q.query('aggs', 'statuses', 'terms', {size: 1000,field: 'status', order: {_term: 'asc'}});
    q.query('aggs', 'zips', 'terms', {size: 1000,field: 'zip', order: {_term: 'asc'}});
    q.query('aggs', 'districts', 'terms', {size: 1000,field: 'district', order: {_term: 'asc'}});
    q.query('aggs', 'descriptions', 'terms', {field: 'description_not_analyzed', size: 10000, order: {_term: 'asc'}});

    return $http.post('/search?size=1000&search_type=count', q.getQuery()).then(function (data) {
      return data.data.aggregations;
    });
  };

  service.descriptions = function (term) {
    var q = new ESQ();
    q.query('query', 'wildcard', {description: '*' + term + '*'});
    q.query('aggs', 'descriptions', 'terms', {size: 1000,field: 'description_not_analyzed', order: {_term: 'asc'}});
    return $http.post('/search?search_type=count&size=1000', q.getQuery()).then(function (data) {
      return data.data.aggregations.descriptions.buckets;
    });
  };

  return service;

});