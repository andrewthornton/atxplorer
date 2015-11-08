'use strict';

angular.module('app', ['ngMaterial', 'atxplorer.directives'])

.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .accentPalette('deep-orange')
    .primaryPalette('teal');
})

.controller('controller', function ($scope, $http) {
  $scope.request = {
    description: 'Animal'
  };

  var q = new ESQ();
  q.query('aggs', 'statuses', 'terms', {size: 1000,field: 'status', order: {_term: 'asc'}});
  q.query('aggs', 'zips', 'terms', {size: 1000,field: 'zip', order: {_term: 'asc'}});
  q.query('aggs', 'districts', 'terms', {size: 1000,field: 'district', order: {_term: 'asc'}});

  $http.post('/search?size=1000&search_type=count', q.getQuery()).success(function (data) {
    $scope.aggregations = data.aggregations;
  });

  $scope.search = function (bounds) {
    var q = new ESQ();
    if($scope.request.description)
      q.query('query', 'filtered', 'query', 'bool', ['must'],'match', {description: $scope.request.description});
    if($scope.request.street)
      q.query('query', 'filtered', 'query', 'bool', ['must'],'match', {street_name: $scope.request.street});
    if(bounds)
      q.query('query', 'filtered', 'filter', ['and'], 'geo_bounding_box', 'location', bounds);
    if($scope.request.zip)
      q.query('query', 'filtered', 'filter', ['and'], 'term', {zip: $scope.request.zip});
    if($scope.request.district)
      q.query('query', 'filtered', 'filter', ['and'], 'term', {district: $scope.request.district});
    if($scope.request.created_date)
      q.query('query', 'filtered', 'filter', ['and'], 'range', 'created_date', {gt: $scope.request.created_date});
    if($scope.request.status)
      q.query('query', 'filtered', 'filter', ['and'], 'term', {'status' : $scope.request.status});

    q.query('aggs', 'day', 'date_histogram', {field: 'created_date', interval: 'day'});

    q.query('sort', 'created_date', {'order': 'desc'});
    $http.post('/search', q.getQuery()).success(function (results) {
      $scope.results = results;
   });
  };

  $scope.search();
});