'use strict';

angular.module('app', ['ngMaterial', 'atxplorer.directives', 'atxplorer.services'])

.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .accentPalette('deep-orange')
    .primaryPalette('teal');
})

.controller('controller', function ($scope, $http, atxSearch) {
  $scope.chartType = 'time';

  $scope.request = {
    description: 'Loud Music'
  };

  atxSearch.dropdowns().then(function (data) {
    $scope.aggregations = data;
  });

  $scope.findDescription = function () {
    atxSearch.descriptions($scope.request.description)
      .then(function (data) {
        $scope.descriptions = data;
      });
  };

  $scope.search = function (bounds) {
    $scope.results = null;
    atxSearch.search($scope.request)
      .then(function (data) {
        console.log(data);
        $scope.results = data;
      });
  };

  $scope.search();
});