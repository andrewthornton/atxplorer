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

  $scope.search = function () {
    $scope.mapResults = null;
    $scope.histogramResults = null;
    atxSearch.search($scope.request)
      .then(function (data) {
        $scope.mapResults = data;
        $scope.histogramResults = data;
        $scope.timeResults = data;
      });
  };

  $scope.searchMap = function (bounds) {
    $scope.timeResults = null;
    $scope.histogramResults = null;
    $scope.request.bounds = bounds;
    atxSearch.search($scope.request)
      .then(function (data) {
        $scope.histogramResults = data;
        $scope.timeResults = data;
      });
  };

  $scope.searchHistogram = function (bounds) {
    $scope.mapResults = null;
    $scope.timeResults = null;
    atxSearch.search($scope.request)
      .then(function (data) {
        $scope.mapResults = data;
        $scope.timeResults = data;
      });
  };

  $scope.searchTime = function (bounds) {
    $scope.mapResults = null;
    $scope.histogramResults = null;
    atxSearch.search($scope.request)
      .then(function (data) {
        $scope.mapResults = data;
        $scope.histogramResults = data;
      });
  };

  $scope.search();
});