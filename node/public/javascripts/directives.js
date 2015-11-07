'use strict';

angular.module('atxplorer.directives', [])

.directive('atxMap', function () {
  return {
    scope: {
      results: '=',
      search: '&'
    },
    replace: true,
    template: '<div class="map"><div>',
    link: function ($scope, elem) {
      L.mapbox.accessToken = 'pk.eyJ1IjoiZW5jb2RpbmdwaXhlbHMiLCJhIjoiYmpGN2pNZyJ9.nJclG_aQ8Taqio-SjNHS8Q';
      var map = L.mapbox.map(elem[0], 'encodingpixels.leb549jf');
      var heat = new L.heatLayer([]).addTo(map);

      function drawMap (data) {
        console.log(data);
        heat.setLatLngs([]);
        data.forEach(function (d) {
          heat.addLatLng(d._source.location.reverse());
        });
      }

      $scope.$watch('results', function (results) {
        if(results) {
          drawMap(results);
        }
      });

      map.on('moveend', function () {
        var bounds = map.getBounds();
        var topLeft = bounds.getNorthWest();
        var bottomRight = bounds.getSouthEast();
        topLeft.lon = topLeft.lng;
        bottomRight.lon = bottomRight.lng;
        var tbounds = {
          top_left: topLeft,
          bottom_right: bottomRight
        };
        $scope.$apply(function () {
          $scope.search({bounds:bounds});
        });
      });
    }
  };
});