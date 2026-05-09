  pr.bulkSelect = pr.bulkSelect || {
    mode: null,
    layer: null,
    control: null,
    points: [],
    previewStops: []
  };

  pr.ensureBulkSelectLayer = function() {
    if (!window.L || !window.map) return null;
    if (!pr.bulkSelect.layer) {
      pr.bulkSelect.layer = L.layerGroup().addTo(pr.routeOverlayTarget());
    }
    return pr.bulkSelect.layer;
  };

  pr.clearBulkSelectLayer = function() {
    if (pr.bulkSelect.layer) pr.bulkSelect.layer.clearLayers();
  };

  pr.removeBulkSelectControl = function() {
    if (pr.bulkSelect.control && window.map) {
      try {
        window.map.removeControl(pr.bulkSelect.control);
      } catch (e) {
        console.warn('Portal Route: unable to remove bulk select control', e);
      }
    }
    pr.bulkSelect.control = null;
  };

  pr.bulkSelectControlHtml = function(mode) {
    var title = mode === 'polygon' ? 'Draw polygon' : 'Draw circle';
    var help = mode === 'polygon'
      ? 'Tap portals area points. Finish after 3+ points.'
      : 'Tap center, then edge.';

    return '' +
      '<div class="portal-route-bulk-select-control-title">' + pr.escapeHtml(title) + '</div>' +
      '<div class="portal-route-bulk-select-control-help">' + pr.escapeHtml(help) + '</div>' +
      '<div class="portal-route-bulk-select-control-buttons">' +
      '<button type="button" data-portal-route-bulk-action="finish"' + (mode === 'polygon' ? '' : ' disabled') + '>Finish</button>' +
      '<button type="button" data-portal-route-bulk-action="cancel">Cancel</button>' +
      '</div>';
  };

  pr.updateBulkSelectControl = function() {
    var container = document.querySelector('.portal-route-bulk-select-control');
    if (!container) return;
    container.innerHTML = pr.bulkSelectControlHtml(pr.bulkSelect.mode);
    var finish = container.querySelector('[data-portal-route-bulk-action="finish"]');
    if (finish) finish.disabled = pr.bulkSelect.mode !== 'polygon' || pr.bulkSelect.points.length < 3;
  };

  pr.showBulkSelectControl = function(mode) {
    if (!window.L || !window.map) return;
    pr.removeBulkSelectControl();

    var BulkSelectControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function() {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control portal-route-bulk-select-control');
        container.innerHTML = pr.bulkSelectControlHtml(mode);
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        container.addEventListener('click', function(ev) {
          var button = ev.target.closest('[data-portal-route-bulk-action]');
          if (!button) return;
          ev.preventDefault();
          ev.stopPropagation();

          var action = button.getAttribute('data-portal-route-bulk-action');
          if (action === 'cancel') pr.cancelBulkPortalSelection();
          if (action === 'finish') pr.finishBulkPortalSelection();
        });
        return container;
      }
    });

    pr.bulkSelect.control = new BulkSelectControl();
    window.map.addControl(pr.bulkSelect.control);
    pr.updateBulkSelectControl();
  };

  pr.loadedPortalStops = function() {
    return Object.keys(window.portals || {}).map(function(guid) {
      return pr.portalToStop(guid);
    }).filter(function(stop) {
      return !!stop;
    });
  };

  pr.pointInPolygon = function(latlng, polygonPoints) {
    if (!latlng || !polygonPoints || polygonPoints.length < 3) return false;

    var inside = false;
    var x = latlng.lng;
    var y = latlng.lat;

    for (var i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
      var xi = polygonPoints[i].lng;
      var yi = polygonPoints[i].lat;
      var xj = polygonPoints[j].lng;
      var yj = polygonPoints[j].lat;
      var intersects = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / ((yj - yi) || 1e-12) + xi);
      if (intersects) inside = !inside;
    }

    return inside;
  };

  pr.selectedStopsInPolygon = function(points) {
    return pr.loadedPortalStops().filter(function(stop) {
      return pr.pointInPolygon({ lat: stop.lat, lng: stop.lng }, points);
    });
  };

  pr.selectedStopsInCircle = function(center, radiusMeters) {
    if (!window.L || !center || !isFinite(radiusMeters)) return [];

    return pr.loadedPortalStops().filter(function(stop) {
      return center.distanceTo(L.latLng(stop.lat, stop.lng)) <= radiusMeters;
    });
  };

  pr.bulkSelectionStartPoint = function(mode, stops) {
    if (mode === 'add' && pr.state.stops.length) {
      var last = pr.state.stops[pr.state.stops.length - 1];
      if (last && typeof last.lat === 'number' && typeof last.lng === 'number') {
        return { lat: last.lat, lng: last.lng };
      }
    }

    if (window.map && window.map.getCenter) {
      var center = window.map.getCenter();
      if (center) return { lat: center.lat, lng: center.lng };
    }

    return stops && stops.length ? { lat: stops[0].lat, lng: stops[0].lng } : null;
  };

  pr.distanceBetweenStops = function(a, b) {
    if (!a || !b) return Infinity;
    if (window.L) return L.latLng(a.lat, a.lng).distanceTo(L.latLng(b.lat, b.lng));

    var dLat = a.lat - b.lat;
    var dLng = a.lng - b.lng;
    return Math.sqrt(dLat * dLat + dLng * dLng);
  };

  pr.orderStopsNearestNeighbor = function(stops, mode) {
    stops = (stops || []).slice();
    if (stops.length < 2) return stops;

    var ordered = [];
    var current = pr.bulkSelectionStartPoint(mode, stops);

    while (stops.length) {
      var bestIndex = 0;
      var bestDistance = Infinity;
      for (var i = 0; i < stops.length; i++) {
        var distance = pr.distanceBetweenStops(current, stops[i]);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      }
      current = stops.splice(bestIndex, 1)[0];
      ordered.push(current);
    }

    return ordered;
  };

  pr.existingPortalGuidSet = function() {
    var seen = {};
    pr.state.stops.forEach(function(stop) {
      if (stop && stop.guid) seen[stop.guid] = true;
    });
    return seen;
  };

  pr.uniquePortalStops = function(stops) {
    var seen = {};
    var result = [];

    (stops || []).forEach(function(stop) {
      if (!stop || !stop.guid || seen[stop.guid]) return;
      seen[stop.guid] = true;
      result.push(stop);
    });

    return result;
  };

  pr.filterNewPortalStops = function(stops) {
    var existing = pr.existingPortalGuidSet();
    return pr.uniquePortalStops(stops).filter(function(stop) {
      return !existing[stop.guid];
    });
  };

  pr.addBulkPortalStops = function(stops) {
    stops = pr.filterNewPortalStops(stops);
    if (!stops.length) {
      pr.showMessage('No new loaded portals to add.');
      return;
    }

    stops = pr.orderStopsNearestNeighbor(stops, 'add');
    if (pr.pushUndoSnapshot) pr.pushUndoSnapshot('add loaded portals');

    stops.forEach(function(stop) {
      pr.state.stops.push({
        guid: stop.guid,
        type: 'portal',
        title: pr.hydratedStopTitle(stop, 'portal', pr.state.stops.length),
        lat: stop.lat,
        lng: stop.lng,
        stopMinutes: typeof stop.stopMinutes === 'number' ? stop.stopMinutes : null,
        startOnMe: false,
        accuracy: null,
        updatedAt: null
      });
    });

    pr.state.selectedMapPointIndex = null;
    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderPointsPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
    pr.showMessage('Added ' + stops.length + ' loaded portals.');
  };

  pr.replaceWithBulkPortalStops = function(stops) {
    stops = pr.orderStopsNearestNeighbor(pr.uniquePortalStops(stops), 'replace');
    if (!stops.length) {
      pr.showMessage('No loaded portals selected.');
      return;
    }
    pr.replaceStops(stops, { openPointsPanel: true });
    pr.markRouteStale({ clearRoute: true });
    pr.showMessage('Replaced route with ' + stops.length + ' loaded portals.');
  };

  pr.closeBulkPortalPreview = function() {
    var content = document.getElementById(pr.DOM_IDS.bulkSelectDialogContent);
    if (content && window.jQuery) {
      try {
        window.jQuery(content).closest('.ui-dialog-content').dialog('close');
        return;
      } catch (e) {
        // Fall through to hiding the content if the IITC dialog wrapper is unavailable.
      }
    }
    if (content) content.style.display = 'none';
  };

  pr.renderBulkPortalPreview = function(stops) {
    var addableCount = pr.filterNewPortalStops(stops).length;
    var replaceCount = pr.uniquePortalStops(stops).length;

    var html = '';
    html += '<div id="' + pr.DOM_IDS.bulkSelectDialogContent + '" class="portal-route-dialog-content portal-route-bulk-select-preview" tabindex="-1">';
    html += '<p><b>Found ' + replaceCount + ' loaded portal' + (replaceCount === 1 ? '' : 's') + '.</b></p>';
    if (replaceCount >= 50) {
      html += '<p>That is a chunky route. Portal Route can add them, but routing services may object.</p>';
    } else if (replaceCount >= 25) {
      html += '<p>That is a pretty healthy route. Portal Route can add them, but plotting may get slow.</p>';
    }
    html += '<p>Only loaded portals are included. Zoom or pan first if you expected more.</p>';
    if (replaceCount !== addableCount) {
      html += '<p>' + (replaceCount - addableCount) + ' already in this route.</p>';
    }
    html += '<div class="portal-route-control-group-buttons portal-route-footer-actions portal-route-bulk-select-actions">';
    html += '<button type="button" data-portal-route-bulk-preview="add"' + (addableCount ? '' : ' disabled') + '>Add to route</button>';
    html += '<button type="button" data-portal-route-bulk-preview="replace"' + (replaceCount ? '' : ' disabled') + '>Replace route</button>';
    html += '<button type="button" data-portal-route-bulk-preview="cancel">Cancel</button>';
    html += '</div>';
    html += '</div>';

    return html;
  };

  pr.openBulkPortalPreview = function(stops) {
    pr.bulkSelect.previewStops = pr.uniquePortalStops(stops);

    if (typeof window.dialog !== 'function') {
      pr.showMessage('Found ' + pr.bulkSelect.previewStops.length + ' loaded portals.');
      return;
    }

    window.dialog({
      id: pr.DOM_IDS.bulkSelectDialog,
      title: 'Select loaded portals',
      html: pr.renderBulkPortalPreview(pr.bulkSelect.previewStops),
      dialogClass: 'portal-route-dialog portal-route-bulk-select-dialog',
      width: pr.getDialogSize(360, 210, 300, 190).width,
      height: pr.getDialogSize(360, 210, 300, 190).height
    });

    var content = document.getElementById(pr.DOM_IDS.bulkSelectDialogContent);
    if (!content) return;

    content.addEventListener('click', function(ev) {
      var button = ev.target.closest('[data-portal-route-bulk-preview]');
      if (!button) return;
      ev.preventDefault();

      var action = button.getAttribute('data-portal-route-bulk-preview');
      var previewStops = pr.bulkSelect.previewStops.slice();
      pr.closeBulkPortalPreview();
      pr.clearBulkSelectLayer();
      pr.bulkSelect.previewStops = [];

      if (action === 'add') pr.addBulkPortalStops(previewStops);
      if (action === 'replace') pr.replaceWithBulkPortalStops(previewStops);
      if (action === 'cancel') pr.showMessage('Portal selection canceled.');
    });
  };

  pr.finishBulkPortalSelection = function() {
    var stops = [];

    if (pr.bulkSelect.mode === 'polygon') {
      if (pr.bulkSelect.points.length < 3) {
        pr.showMessage('Add at least 3 polygon points.');
        return;
      }
      stops = pr.selectedStopsInPolygon(pr.bulkSelect.points);
    } else if (pr.bulkSelect.mode === 'circle') {
      if (!pr.bulkSelect.center || !isFinite(pr.bulkSelect.radiusMeters)) {
        pr.showMessage('Tap center, then edge.');
        return;
      }
      stops = pr.selectedStopsInCircle(pr.bulkSelect.center, pr.bulkSelect.radiusMeters);
    }

    pr.stopBulkSelectMode({ keepShape: true });
    pr.openBulkPortalPreview(stops);
  };

  pr.bulkSelectStyle = function() {
    return {
      color: '#00e5ff',
      haloColor: '#111111',
      fillColor: '#00e5ff'
    };
  };

  pr.drawBulkVertex = function(layer, point) {
    var style = pr.bulkSelectStyle();

    L.circleMarker(point, {
      radius: 8,
      weight: 4,
      color: style.haloColor,
      fillColor: style.fillColor,
      fillOpacity: 0.95,
      opacity: 0.85
    }).addTo(layer);

    L.circleMarker(point, {
      radius: 5,
      weight: 2,
      color: '#ffffff',
      fillColor: style.fillColor,
      fillOpacity: 1
    }).addTo(layer);
  };

  pr.drawBulkPath = function(layer, points, closePath) {
    if (!points || points.length < 2) return;

    var style = pr.bulkSelectStyle();
    var pathPoints = points.slice();
    if (closePath && points.length > 2) pathPoints.push(points[0]);

    L.polyline(pathPoints, {
      color: style.haloColor,
      weight: 6,
      opacity: 0.55
    }).addTo(layer);

    L.polyline(pathPoints, {
      color: style.color,
      weight: 3,
      opacity: 1
    }).addTo(layer);
  };

  pr.redrawBulkPolygon = function() {
    var layer = pr.ensureBulkSelectLayer();
    if (!layer || !window.L) return;

    layer.clearLayers();
    var points = pr.bulkSelect.points;
    if (!points.length) return;

    if (points.length > 2) {
      var style = pr.bulkSelectStyle();
      L.polygon(points, {
        color: style.color,
        weight: 0,
        fillColor: style.fillColor,
        fillOpacity: 0.18
      }).addTo(layer);
      pr.drawBulkPath(layer, points, true);
    } else {
      pr.drawBulkPath(layer, points, false);
    }

    points.forEach(function(point) {
      pr.drawBulkVertex(layer, point);
    });
  };

  pr.drawBulkCircle = function() {
    var layer = pr.ensureBulkSelectLayer();
    if (!layer || !window.L || !pr.bulkSelect.center || !isFinite(pr.bulkSelect.radiusMeters)) return;

    layer.clearLayers();
    var style = pr.bulkSelectStyle();
    L.circle(pr.bulkSelect.center, {
      radius: pr.bulkSelect.radiusMeters,
      color: style.haloColor,
      weight: 6,
      opacity: 0.55,
      fillOpacity: 0
    }).addTo(layer);
    L.circle(pr.bulkSelect.center, {
      radius: pr.bulkSelect.radiusMeters,
      color: style.color,
      weight: 3,
      fillColor: style.fillColor,
      fillOpacity: 0.18
    }).addTo(layer);
    pr.drawBulkVertex(layer, pr.bulkSelect.center);
  };

  pr.handleBulkSelectMapClick = function(e) {
    if (!pr.bulkSelect.mode || !e || !e.latlng) return;
    if (pr.isLayerEnabled && !pr.isLayerEnabled()) return;

    if (pr.bulkSelect.mode === 'polygon') {
      pr.bulkSelect.points.push(e.latlng);
      pr.redrawBulkPolygon();
      pr.updateBulkSelectControl();
      return;
    }

    if (pr.bulkSelect.mode === 'circle') {
      if (!pr.bulkSelect.center) {
        pr.bulkSelect.center = e.latlng;
        pr.bulkSelect.radiusMeters = 0;
        pr.showMessage('Tap circle edge to finish.');
        return;
      }

      pr.bulkSelect.radiusMeters = pr.bulkSelect.center.distanceTo(e.latlng);
      pr.drawBulkCircle();
      pr.finishBulkPortalSelection();
    }
  };

  pr.stopBulkSelectMode = function(options) {
    options = options || {};
    if (window.map && pr.bulkSelect.mapClickHandler) {
      window.map.off('click', pr.bulkSelect.mapClickHandler);
    }
    pr.bulkSelect.mapClickHandler = null;
    pr.bulkSelect.mode = null;
    pr.bulkSelect.points = [];
    pr.bulkSelect.center = null;
    pr.bulkSelect.radiusMeters = null;
    pr.removeBulkSelectControl();
    if (!options.keepShape) pr.clearBulkSelectLayer();

    var mapContainer = window.map && window.map.getContainer ? window.map.getContainer() : null;
    if (mapContainer && mapContainer.classList) {
      mapContainer.classList.remove('portal-route-bulk-select-mode');
    }
  };

  pr.cancelBulkPortalSelection = function() {
    pr.stopBulkSelectMode();
    pr.closeBulkPortalPreview();
    pr.showMessage('Portal selection canceled.');
  };

  pr.startBulkPortalSelection = function(mode) {
    if (!window.L || !window.map) {
      pr.showMessage('Map is not ready.');
      return;
    }

    if (pr.cancelAddPointMode) pr.cancelAddPointMode({ silent: true });
    pr.stopBulkSelectMode();
    pr.closeBulkPortalPreview();
    pr.ensureBulkSelectLayer();

    pr.bulkSelect.mode = mode;
    pr.bulkSelect.points = [];
    pr.bulkSelect.center = null;
    pr.bulkSelect.radiusMeters = null;
    pr.bulkSelect.mapClickHandler = pr.handleBulkSelectMapClick;
    window.map.on('click', pr.bulkSelect.mapClickHandler);
    pr.showBulkSelectControl(mode);

    var mapContainer = window.map.getContainer ? window.map.getContainer() : null;
    if (mapContainer && mapContainer.classList) {
      mapContainer.classList.add('portal-route-bulk-select-mode');
    }

    pr.showMessage(mode === 'polygon' ? 'Tap polygon points, then Finish.' : 'Tap circle center.');
  };

  pr.bulkSelectMenuItems = function() {
    return [
      { label: 'Circle', action: 'select-portals-circle' },
      { label: 'Polygon', action: 'select-portals-polygon' },
      { label: 'Cancel', action: 'cancel-bulk-select' }
    ];
  };

  pr.openBulkSelectMenu = function(x, y, options) {
    pr.openRouteContextMenu(pr.bulkSelectMenuItems(), 'portal-route-bulk-select-menu', x, y, options);
  };
