  pr.routeOverlayTarget = function() {
    if (pr.layerGroup) return pr.layerGroup;
    return window.map;
  };

  pr.ensureLayers = function() {
    var target = pr.routeOverlayTarget();

    if (!pr.state.layers.labels) {
      pr.state.layers.labels = L.layerGroup().addTo(target);
    }

    if (!pr.state.layers.segmentLabels) {
      pr.state.layers.segmentLabels = L.layerGroup().addTo(target);
    }
  };

  pr.clearLabels = function() {
    if (pr.state.layers.labels) {
      pr.state.layers.labels.clearLayers();
    }
  };

  pr.clearSegmentTimeLabels = function() {
    if (pr.state.layers.segmentLabels) {
      pr.state.layers.segmentLabels.clearLayers();
    }
  };

  pr.clearRouteLine = function() {
    if (pr.state.layers.routeLine) {
      var owner = pr.routeOverlayTarget();
      if (owner && owner.hasLayer && owner.hasLayer(pr.state.layers.routeLine)) {
        owner.removeLayer(pr.state.layers.routeLine);
      } else if (window.map && window.map.hasLayer && window.map.hasLayer(pr.state.layers.routeLine)) {
        window.map.removeLayer(pr.state.layers.routeLine);
      }
      pr.state.layers.routeLine = null;
    }

    pr.clearSegmentTimeLabels();
  };

  pr.redrawLabels = function() {
    if (!window.map || !window.L) return;
    pr.ensureLayers();
    pr.clearLabels();

    pr.getRouteStops().forEach(function(stop, index) {
      var isLoop = !!stop.generatedLoop;
      var isSelected = !isLoop && pr.selectedStopIndex && pr.selectedStopIndex() === index;
      var selectedClass = isSelected ? ' portal-route-stop-label-selected' : '';
      var startEndClass = '';
      var hasLoopStop = !!(pr.makeLoopStop && pr.makeLoopStop() && pr.state.stops.length > 1);
      if (!isLoop && hasLoopStop && (index === 0 || index === pr.state.stops.length - 1)) {
        startEndClass += ' portal-route-stop-label-loop-endpoint';
      } else {
        if (!isLoop && index === 0) startEndClass += ' portal-route-stop-label-start';
        if (!isLoop && pr.state.stops.length > 1 && index === pr.state.stops.length - 1) {
          startEndClass += ' portal-route-stop-label-end';
        }
      }
      var isMapPoint = stop.type === 'map';
      var canDragMapPoint = isMapPoint && !pr.isManagedStartStop(stop);
      var label = isLoop ? 'L' : (index + 1);
      var labelClass = String(label).length > 2 ? ' portal-route-stop-label-wide' : '';
      var title = isLoop ? 'Loop back to ' + stop.title : (index + 1) + '. ' + stop.title;

      var selectStop = function(e) {
        if (e.originalEvent && e.originalEvent.stopPropagation) e.originalEvent.stopPropagation();
        if (e.originalEvent && e.originalEvent.preventDefault) e.originalEvent.preventDefault();
        pr.selectStopPortal(index, false);
      };

      var stopMarkerEvent = function(e) {
        var originalEvent = e && e.originalEvent ? e.originalEvent : e;
        if (originalEvent && originalEvent.stopPropagation) originalEvent.stopPropagation();
        if (originalEvent && originalEvent.preventDefault) originalEvent.preventDefault();
      };

      var openRouteList = function(e) {
        stopMarkerEvent(e);
        pr.selectStopPortal(index, false);
        pr.state.panelView = 'main';
        pr.state.panelOpen = true;
        pr.savePanelOpen();
        pr.renderPanel();
      };

      var makeClickHandler = function() {
        var clickTimer = null;

        return function(e) {
          stopMarkerEvent(e);

          if (!window.setTimeout || !window.clearTimeout) {
            selectStop(e);
            return;
          }

          if (clickTimer) {
            window.clearTimeout(clickTimer);
            clickTimer = null;
            openRouteList(e);
            return;
          }

          clickTimer = window.setTimeout(function() {
            clickTimer = null;
            selectStop(e);
          }, 300);
        };
      };

      var pointMarker = null;

      if (isMapPoint) {
        var pointIcon = L.divIcon({
          className: 'portal-route-map-point-marker' + (isSelected ? ' portal-route-map-point-marker-selected' : ''),
          html: '<span></span>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        pointMarker = L.marker([stop.lat, stop.lng], {
          icon: pointIcon,
          draggable: canDragMapPoint,
          interactive: true,
          keyboard: false,
          bubblingMouseEvents: false,
          title: title
        });

        pointMarker.on('click', makeClickHandler());
        pointMarker.addTo(pr.state.layers.labels);
      }

      var icon = L.divIcon({
        className: 'portal-route-stop-label' + labelClass + startEndClass + (isMapPoint ? ' portal-route-map-point-label' : '') + (canDragMapPoint ? ' portal-route-map-point-label-draggable' : '') + (isLoop ? ' portal-route-loop-label' : '') + selectedClass,
        html: '<span>' + label + '</span>',
        iconSize: [18, 18],
        iconAnchor: isLoop ? [-18, 24] : [0, 24]
      });

      var marker = L.marker([stop.lat, stop.lng], {
        icon: icon,
        draggable: canDragMapPoint,
        interactive: true,
        keyboard: false,
        bubblingMouseEvents: false,
        title: title
      });

      marker.on('click', makeClickHandler());

      if (canDragMapPoint) {
        var attachMapPointDragging = function(dragMarker, draggingClass) {
          dragMarker.on('dragstart', function(e) {
            if (e.target && e.target._icon) e.target._icon.classList.add(draggingClass);
            pr.state.selectedMapPointIndex = index;
            if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
            if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
            pr.renderPanel();
            pr.renderMiniControl();
          });
          dragMarker.on('drag', function(e) {
            var latlng = e.target.getLatLng();
            pr.updateMapPointPosition(index, latlng, { live: true });
            if (pointMarker) pointMarker.setLatLng(latlng);
            marker.setLatLng(latlng);
          });
          dragMarker.on('dragend', function(e) {
            if (e.target && e.target._icon) e.target._icon.classList.remove(draggingClass);
            pr.updateMapPointPosition(index, e.target.getLatLng());
          });
        };

        if (pointMarker) attachMapPointDragging(pointMarker, 'portal-route-map-point-marker-dragging');
        attachMapPointDragging(marker, 'portal-route-stop-label-dragging');
      }

      marker.bindTooltip(title, {
        direction: 'right',
        offset: [16, -10],
        opacity: 0.9,
        interactive: false,
        className: 'portal-route-stop-tooltip'
      });

      marker.addTo(pr.state.layers.labels);
    });
  };

  pr.toLatLng = function(point) {
    if (!point) return null;
    if (point.lat && typeof point.lat === 'function' && point.lng && typeof point.lng === 'function') {
      return L.latLng(point.lat(), point.lng());
    }
    if (typeof point.lat === 'number' && typeof point.lng === 'number') {
      return L.latLng(point.lat, point.lng);
    }
    return null;
  };

  pr.getPathMidpoint = function(path) {
    if (!path || path.length === 0) return null;

    var points = path.map(pr.toLatLng).filter(Boolean);
    if (points.length === 0) return null;
    if (points.length === 1) return points[0];

    var total = 0;
    for (var i = 1; i < points.length; i++) {
      total += points[i - 1].distanceTo(points[i]);
    }

    if (!total) return points[Math.floor(points.length / 2)];

    var halfway = total / 2;
    var walked = 0;

    for (var j = 1; j < points.length; j++) {
      var from = points[j - 1];
      var to = points[j];
      var segment = from.distanceTo(to);

      if (walked + segment >= halfway) {
        var ratio = segment ? (halfway - walked) / segment : 0;
        return L.latLng(
          from.lat + (to.lat - from.lat) * ratio,
          from.lng + (to.lng - from.lng) * ratio
        );
      }

      walked += segment;
    }

    return points[Math.floor(points.length / 2)];
  };

  pr.getLegLabelLatLng = function(leg) {
    var midpoint = pr.getPathMidpoint(leg && leg.path);
    if (midpoint) return midpoint;

    var stops = pr.getRouteStops();
    var fromStop = stops[leg.fromIndex];
    var toStop = stops[leg.toIndex];
    if (!fromStop || !toStop) return null;

    return L.latLng(
      (fromStop.lat + toStop.lat) / 2,
      (fromStop.lng + toStop.lng) / 2
    );
  };

  pr.redrawSegmentTimeLabels = function() {
    if (!window.map || !window.L) return;
    pr.ensureLayers();
    pr.clearSegmentTimeLabels();

    if (!pr.state.settings.showSegmentTimesOnMap) return;
    if (!pr.state.route || !Array.isArray(pr.state.route.legs)) return;

    pr.state.route.legs.forEach(function(leg) {
      var latLng = pr.getLegLabelLatLng(leg);
      if (!latLng) return;

      var text = leg.durationText || pr.formatDuration(leg.durationSeconds);
      var icon = L.divIcon({
        className: 'portal-route-segment-time-label',
        html: '<span>' + pr.escapeHtml(text) + '</span>',
        iconSize: null,
        iconAnchor: [16, 8]
      });

      L.marker(latLng, {
        icon: icon,
        interactive: false,
        keyboard: false,
        bubblingMouseEvents: false
      }).addTo(pr.state.layers.segmentLabels);
    });
  };

  pr.getRouteLineStyle = function() {
    if (pr.state.routeDirty) {
      return {
        color: '#ff7f00',
        weight: 5,
        opacity: 0.35,
        dashArray: '',
        interactive: false,
        bubblingMouseEvents: false
      };
    }

    return {
      color: '#ff7f00',
      weight: 5,
      opacity: 0.8,
      dashArray: '',
      interactive: false,
      bubblingMouseEvents: false
    };
  };

  pr.applyRouteLineStyle = function() {
    if (!pr.state.layers.routeLine || !pr.state.layers.routeLine.setStyle) return;
    pr.state.layers.routeLine.setStyle(pr.getRouteLineStyle());
  };

  pr.drawRoutePath = function(path) {
    pr.clearRouteLine();
    if (!path || path.length < 2) return;

    pr.state.layers.routeLine = L.polyline(path, pr.getRouteLineStyle()).addTo(pr.routeOverlayTarget());

    pr.redrawSegmentTimeLabels();
  };

  pr.fitRouteToMap = function() {
    if (!window.map || !pr.state.layers.routeLine || !pr.state.layers.routeLine.getBounds) {
      pr.showMessage('Plot a route first.');
      return;
    }

    try {
      window.map.fitBounds(pr.state.layers.routeLine.getBounds(), { padding: [30, 30] });
    } catch (e) {
      console.warn('Portal Route: unable to fit route bounds', e);
      pr.showMessage('Could not fit route.');
    }
  };

  pr.redrawRouteLine = function() {
    if (!window.map || !window.L) return;
    if (!pr.state.route || !Array.isArray(pr.state.route.path)) return;

    var path = pr.state.route.path.map(function(point) {
      return L.latLng(point.lat, point.lng);
    });

    pr.drawRoutePath(path);
  };
