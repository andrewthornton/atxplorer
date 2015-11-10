'use strict';

angular.module('atxplorer.directives', [])

.directive('atxMap', function () {
  return {
    scope: {
      results: '=',
      search: '&',
      clearBox: '='
    },
    replace: true,
    template: '<div class="map"><div>',
    link: function ($scope, elem) {
      L.mapbox.accessToken = 'pk.eyJ1IjoiZW5jb2RpbmdwaXhlbHMiLCJhIjoiYmpGN2pNZyJ9.nJclG_aQ8Taqio-SjNHS8Q';
      var map = L.mapbox.map(elem[0], 'encodingpixels.leb549jf');
      var heat = new L.heatLayer([]).addTo(map);
      var featureGroup = new L.featureGroup().addTo(map);

      var drawControl = new L.Control.Draw({
        draw: {
          polyline: false,
          circle: false,
          polygon: false,
          marker: false
        },
        edit: {
          featureGroup: featureGroup,
          edit:false
        }
      }).addTo(map);

      function drawMap (data) {
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

      $scope.$watch('clearBox', function (val) {
        if(val) featureGroup.clearLayers();
      });

      map.on('draw:drawstart', function () {
        featureGroup.clearLayers();
      });

      map.on('draw:deletestop', function () {
        featureGroup.clearLayers();
        $scope.$apply(function () {
          $scope.search();
        });
      });

      map.on('draw:created', function (e) {
        featureGroup.addLayer(e.layer);
        var bounds = e.layer.getBounds();
        var topLeft = bounds.getNorthWest();
        var bottomRight = bounds.getSouthEast();
        topLeft.lon = topLeft.lng;
        bottomRight.lon = bottomRight.lng;
        delete topLeft.lng;
        delete bottomRight.lng;
        var tbounds = {
          top_left: topLeft,
          bottom_right: bottomRight
        };
        $scope.$apply(function () {
          $scope.search({bounds:tbounds});
        });
      });
    }
  };
})

.directive('atxBar', function () {
  return {
    scope: {
      data: '=',
      click: '&'
    },
    template: '<div class="chart"></div>',
    replace: true,
    link: function ($scope, elem) {

      var e = d3.select(elem[0]);
      var outerWidth = elem[0].clientWidth,
          outerHeight = elem[0].clientHeight,
          margins = {top: 20, right:20, bottom: 40, left:60},
          width = outerWidth - margins.right - margins.left,
          height = outerHeight - margins.top - margins.bottom;

      var svg = e.append('svg')
          .attr('width', outerWidth)
          .attr('height', outerHeight)
        .append('g')
          .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

      var background = svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', '#fff');

      var key = svg.append('g');

      var keyText = key.append('text')
        .attr('dy', '-0.78em')
        .style('font-size', '10px');

      var x = d3.scale.ordinal()
        .rangeBands([0,width]);

      var y = d3.scale.linear()
        .range([height, 0]);

      var yAxis = d3.svg.axis().scale(y).orient('left');

      var yAxisG = svg.append('g')
        .attr('class', 'axis');

      var data;
      $scope.$watch('data', function (d) {
        if(d) {
          data = d;
          draw();
        }
      });

      var bars;

      // d3.select(window).on('resize', function () {
      //     outerWidth = elem[0].clientWidth;
      //     outerHeight = elem[0].clientHeight;
      //     width = outerWidth - margins.right - margins.left;
      //     height = outerHeight - margins.top - margins.bottom;
      //     e.select('svg')
      //       .attr('width', outerWidth)
      //       .attr('height', outerHeight);
      //     draw();
      // });

      function draw () {
        x.domain(data.map(function (d) {return d.key;})).rangeBands([0, width], 0.1, 0.9);
        y.domain([0, d3.max(data, function (d) {return d.doc_count;})]).range([height, 0]).nice();
        yAxisG.call(yAxis);
        keyText.text('');

        bars = svg.selectAll('.bars')
          .data(data);

        bars.enter().append('rect');

        bars
          .on('mouseover', function (d) {
            d3.select(this).style('fill-opacity', 1);
            keyText.text(d.key + ' (' + d.doc_count +')');
            key.attr('transform', 'translate(' + x(d.key) +',' + y(d.doc_count)+ ')');
          })
          .on('mouseleave', function () {
            keyText.text('');
            d3.select(this).style('fill-opacity', 0.5);
          })
          .on('click', function (d) {
            $scope.$apply(function () {
              $scope.click({description:d.key});
            });
          })
          .transition()
          .attr('class', 'bars')
          .attr('x', function (d) {return x(d.key);})
          .attr('width', x.rangeBand())
          .attr('y', function (d) {return y(d.doc_count);})
          .attr('height', function (d) {return height - y(d.doc_count);})
          .style({
            'fill': '#FF5722',
            'fill-opacity': 0.5,
          });


        bars.exit().remove();
      }
    }
  };
})
.directive('atxChart', function () {
  return {
    scope: {
      data: '='
    },
    template: '<div class="chart"></div>',
    replace: true,
    link: function ($scope, elem) {

      var e = d3.select(elem[0]);
      var outerWidth = elem[0].clientWidth,
          outerHeight = elem[0].clientHeight,
          margins = {top: 20, right:20, bottom: 40, left:60},
          width = outerWidth - margins.right - margins.left,
          height = outerHeight - margins.top - margins.bottom;

      var svg = e.append('svg')
          .attr('width', outerWidth)
          .attr('height', outerHeight)
        .append('g')
          .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

      var background = svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', '#fff');

      var x = d3.time.scale()
        .range([0,width]);

      var y = d3.scale.linear()
        .range([height, 0]);

      var xAxis = d3.svg.axis().scale(x);

      var yAxis = d3.svg.axis().scale(y).orient('left');

      var xAxisG = svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')');

      var yAxisG = svg.append('g')
        .attr('class', 'axis');

      var data;
      $scope.$watch('data', function (d) {
        if(d) {
          data = d;
          draw();
        }
      });

      var bars;

      var zoom = d3.behavior.zoom()
        .x(x)
        .on('zoom', function () {
          bars.attr('d', path);
          xAxisG.call(xAxis);
        });

      var path = d3.svg.line()
        .x(function (d) {return x(d.key);})
        .y(function (d) {return y(d.doc_count);});

      // background.call(zoom);
      // d3.select(window).on('resize', function () {
      //     outerWidth = elem[0].clientWidth;
      //     outerHeight = elem[0].clientHeight;
      //     width = outerWidth - margins.right - margins.left;
      //     height = outerHeight - margins.top - margins.bottom;
      //     e.select('svg')
      //       .attr('width', outerWidth)
      //       .attr('height', outerHeight);
      //     draw();
      // });

      function draw () {
        x.domain(d3.extent(data, function (d) {return d.key;})).range([0, width]);
        y.domain([0, d3.max(data, function (d) {return d.doc_count;})]).range([height, 0]).nice();
        xAxisG.call(xAxis);
        yAxisG.call(yAxis);

        zoom.x(x);

        bars = svg.selectAll('.bars')
          .data([data]);

        bars.enter().append('path');

        bars
          .transition()
          .attr('d', path)
          .attr('class', 'bars')
          .style({
            'stroke': '#FF5722',
            'fill': 'none'
          });

        bars.exit().remove();
      }
    }
  };
});