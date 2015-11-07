'use strict';

angular.module('app', ['ngMaterial', 'atxplorer.directives'])

.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .accentPalette('deep-orange')
    .primaryPalette('teal');
})

.controller('controller', function ($scope, $http) {
  $scope.request = {};
  $scope.districts = [1,2,3,4,5,6,7,8,9,10];

  $scope.search = function (location) {
    var q = new ESQ();
    if($scope.request.description)
      q.query('query', 'bool', ['must'],'match', {description: $scope.request.description});
    if($scope.request.street)
      q.query('query', 'bool', ['must'],'match', {street_name: $scope.request.street});

    if(location)
      q.query('filter', ['and'], 'geo_bounding_box', 'location', location);
    if($scope.request.zip)
      q.query('filter', ['and'], 'term', {zip: $scope.request.zip});
    if($scope.request.district)
      q.query('filter', ['and'], 'term', {district: $scope.request.district});

    $http.post('/search', q.getQuery()).success(function (results) {
      $scope.results = results;
   });
  };
});