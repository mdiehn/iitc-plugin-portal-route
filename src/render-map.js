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

  pr.portalAtLatLng = function(latlng, excludeIndex) {
    if (!window.map || !window.L || !latlng) return null;

    var dropPoint = window.map.latLngToLayerPoint(latlng);
    var best = null;
    var maxDistance = 28;

    Object.keys(window.portals || {}).forEach(function(guid) {
      var stop = excludeIndex >= 0 ? pr.state.stops[excludeIndex] : null;
      if (stop && stop.guid === guid) return;

      var portal = window.portals[guid];
      if (!portal || !portal.getLatLng) return;

      var point = window.map.latLngToLayerPoint(portal.getLatLng());
      var distance = point.distanceTo(dropPoint);
      if (distance <= maxDistance && (!best || distance < best.distance)) {
        best = {
          distance: distance,
          guid: guid
        };
      }
    });

    if (!best) return null;
    return pr.portalToStop(best.guid);
  };

  pr.mapReplacementStop = function(index, latlng) {
    var portalStop = pr.portalAtLatLng(latlng, index);
    if (portalStop) return portalStop;

    var existing = pr.state.stops[index] || {};
    return {
      type: 'map',
      title: existing.type === 'map' && existing.title ? existing.title : 'Map point ' + (index + 1),
      lat: latlng.lat,
      lng: latlng.lng
    };
  };

  pr.stopMarkerTitle = function(stop, index) {
    return stop.generatedLoop ? 'Loop back to ' + stop.title : (index + 1) + '. ' + stop.title;
  };

  pr.stopLabelClass = function(stop, index, hasLoopStop) {
    var isLoop = !!stop.generatedLoop;
    var isSelected = !isLoop && pr.selectedStopIndex && pr.selectedStopIndex() === index;
    var isMapPoint = stop.type === 'map';
    var canDragRouteStop = !isLoop && !pr.isManagedStartStop(stop);
    var label = isLoop ? 'L' : (index + 1);
    var className = 'portal-route-stop-label';

    if (String(label).length > 2) className += ' portal-route-stop-label-wide';
    if (!isLoop && hasLoopStop && (index === 0 || index === pr.state.stops.length - 1)) {
      className += ' portal-route-stop-label-loop-endpoint';
    } else {
      if (!isLoop && index === 0) className += ' portal-route-stop-label-start';
      if (!isLoop && pr.state.stops.length > 1 && index === pr.state.stops.length - 1) {
        className += ' portal-route-stop-label-end';
      }
    }
    if (isMapPoint) className += ' portal-route-map-point-label';
    if (canDragRouteStop) className += ' portal-route-stop-label-draggable';
    if (isLoop) className += ' portal-route-loop-label';
    if (isSelected) className += ' portal-route-stop-label-selected';

    return className;
  };

  pr.stopMarkerEvent = function(e) {
    var originalEvent = e && e.originalEvent ? e.originalEvent : e;
    if (originalEvent && originalEvent.stopPropagation) originalEvent.stopPropagation();
    if (originalEvent && originalEvent.preventDefault) originalEvent.preventDefault();
  };

  pr.openRouteListForStop = function(index, e) {
    pr.stopMarkerEvent(e);
    pr.selectStopPortal(index, false);
    if (pr.openMainPanel) {
      pr.openMainPanel();
    } else {
      pr.state.panelOpen = true;
      pr.savePanelOpen();
      pr.renderPanel();
    }
  };

  pr.stopClickHandler = function(index) {
    var clickTimer = null;

    return function(e) {
      pr.stopMarkerEvent(e);

      if (!window.setTimeout || !window.clearTimeout) {
        pr.selectStopPortal(index, false);
        return;
      }

      if (clickTimer) {
        window.clearTimeout(clickTimer);
        clickTimer = null;
        pr.openRouteListForStop(index, e);
        return;
      }

      clickTimer = window.setTimeout(function() {
        clickTimer = null;
        pr.selectStopPortal(index, false);
      }, 300);
    };
  };

  pr.createMapPointMarker = function(stop, index, title, clickHandler) {
    var isSelected = pr.selectedStopIndex && pr.selectedStopIndex() === index;
    var pointIcon = L.divIcon({
      className: 'portal-route-map-point-marker' + (isSelected ? ' portal-route-map-point-marker-selected' : ''),
      html: '<span></span>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    var marker = L.marker([stop.lat, stop.lng], {
      icon: pointIcon,
      draggable: !pr.isManagedStartStop(stop),
      interactive: true,
      keyboard: false,
      bubblingMouseEvents: false,
      title: title
    });

    marker.on('click', clickHandler);
    return marker;
  };

  pr.createStopLabelMarker = function(stop, index, hasLoopStop, title, clickHandler) {
    var isLoop = !!stop.generatedLoop;
    var label = isLoop ? 'L' : (index + 1);
    var icon = L.divIcon({
      className: pr.stopLabelClass(stop, index, hasLoopStop),
      html: '<span>' + label + '</span>',
      iconSize: [18, 18],
      iconAnchor: isLoop ? [-18, 24] : [0, 24]
    });

    var marker = L.marker([stop.lat, stop.lng], {
      icon: icon,
      draggable: !isLoop && !pr.isManagedStartStop(stop),
      interactive: true,
      keyboard: false,
      bubblingMouseEvents: false,
      title: title
    });

    marker.on('click', clickHandler);
    marker.bindTooltip(title, {
      direction: 'right',
      offset: [16, -10],
      opacity: 0.9,
      interactive: false,
      className: 'portal-route-stop-tooltip'
    });

    return marker;
  };

  pr.attachMapPointDragHandlers = function(index, pointMarker, labelMarker) {
    if (!pointMarker) return;

    pointMarker.on('dragstart', function(e) {
      if (e.target && e.target._icon) e.target._icon.classList.add('portal-route-map-point-marker-dragging');
      pr.state.selectedMapPointIndex = index;
      if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
      if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
      pr.renderPanel();
      pr.renderMiniControl();
    });
    pointMarker.on('drag', function(e) {
      var latlng = e.target.getLatLng();
      pr.updateMapPointPosition(index, latlng, { live: true });
      pointMarker.setLatLng(latlng);
      labelMarker.setLatLng(latlng);
    });
    pointMarker.on('dragend', function(e) {
      if (e.target && e.target._icon) e.target._icon.classList.remove('portal-route-map-point-marker-dragging');
      pr.updateMapPointPosition(index, e.target.getLatLng());
    });
  };

  pr.attachStopLabelDragHandlers = function(index, stop, labelMarker) {
    labelMarker.on('dragstart', function(e) {
      var originalPoint = e.target && e.target.getLatLng
        ? window.map.latLngToLayerPoint(e.target.getLatLng())
        : null;
      pr.state.stopReplaceDragStartPoint = originalPoint;
      if (stop.guid) {
        pr.state.selectedMapPointIndex = null;
        window.selectedPortal = stop.guid;
      } else {
        pr.state.selectedMapPointIndex = index;
        if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
      }
      if (e.target && e.target._icon) e.target._icon.classList.add('portal-route-stop-label-dragging');
      pr.renderPanel();
      pr.renderMiniControl();
    });
    labelMarker.on('dragend', function(e) {
      if (e.target && e.target._icon) e.target._icon.classList.remove('portal-route-stop-label-dragging');

      var latlng = e.target.getLatLng();
      var dropPoint = window.map.latLngToLayerPoint(latlng);
      var startPoint = pr.state.stopReplaceDragStartPoint;
      pr.state.stopReplaceDragStartPoint = null;

      if (startPoint && dropPoint && startPoint.distanceTo(dropPoint) < 8) {
        pr.redrawLabels();
        return;
      }

      if (!pr.replaceStopLocation(index, pr.mapReplacementStop(index, latlng))) {
        pr.redrawLabels();
      }
    });
  };

  pr.redrawLabels = function() {
    if (!window.map || !window.L) return;
    pr.ensureLayers();
    pr.clearLabels();

    var loopStop = pr.makeLoopStop && pr.makeLoopStop();
    var hasLoopStop = !!(loopStop && pr.state.stops.length > 1);

    pr.getRouteStops().forEach(function(stop, index) {
      var isLoop = !!stop.generatedLoop;
      var isMapPoint = stop.type === 'map';
      var canDragMapPoint = isMapPoint && !pr.isManagedStartStop(stop);
      var canDragRouteStop = !isLoop && !pr.isManagedStartStop(stop);
      var title = pr.stopMarkerTitle(stop, index);
      var clickHandler = pr.stopClickHandler(index);
      var pointMarker = null;

      if (isMapPoint) {
        pointMarker = pr.createMapPointMarker(stop, index, title, clickHandler);
        pointMarker.addTo(pr.state.layers.labels);
      }

      var labelMarker = pr.createStopLabelMarker(stop, index, hasLoopStop, title, clickHandler);

      if (canDragMapPoint) {
        pr.attachMapPointDragHandlers(index, pointMarker, labelMarker);
      }
      if (canDragRouteStop) {
        pr.attachStopLabelDragHandlers(index, stop, labelMarker);
      }

      labelMarker.addTo(pr.state.layers.labels);
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
