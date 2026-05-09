  pr.ORS_PROFILES = {
    drive: 'driving-car',
    bike: 'cycling-regular',
    walk: 'foot-walking'
  };

  pr.orsProfileForTravelMode = function(mode) {
    mode = pr.normalizeTravelMode(mode);
    return pr.ORS_PROFILES[mode] || pr.ORS_PROFILES.drive;
  };

  pr.getOrsBaseUrl = function() {
    return String(pr.state.settings.orsBaseUrl || pr.DEFAULT_SETTINGS.orsBaseUrl || '').trim().replace(/\/+$/, '');
  };

  pr.getOrsApiKey = function() {
    return String(pr.state.settings.orsApiKey || '').trim();
  };

  pr.orsRouteUrl = function(profile) {
    return pr.getOrsBaseUrl() + '/v2/directions/' + encodeURIComponent(profile) + '/geojson';
  };

  pr.orsErrorMessage = function(data, status) {
    if (data && data.error && data.error.message) return data.error.message;
    if (data && data.error && data.error.code) return 'OpenRouteService error ' + data.error.code;
    if (data && data.message) return data.message;
    if (status) return 'OpenRouteService request failed: HTTP ' + status;
    return 'OpenRouteService request failed.';
  };

  pr.orsPathDistanceMeters = function(points) {
    if (!points || points.length < 2 || !window.L) return 0;

    var distance = 0;
    for (var i = 1; i < points.length; i++) {
      distance += L.latLng(points[i - 1].lat, points[i - 1].lng).distanceTo(L.latLng(points[i].lat, points[i].lng));
    }
    return distance;
  };

  pr.orsLegPath = function(path, steps) {
    if (!path || !path.length || !steps || !steps.length) return [];

    var start = null;
    var end = null;
    steps.forEach(function(step) {
      var wayPoints = step && step.way_points;
      if (!Array.isArray(wayPoints) || wayPoints.length < 2) return;
      if (start === null || wayPoints[0] < start) start = wayPoints[0];
      if (end === null || wayPoints[1] > end) end = wayPoints[1];
    });

    if (start === null || end === null || start < 0 || end < start) return [];
    return path.slice(start, end + 1);
  };

  pr.orsFallbackLegDistance = function(stops, index) {
    var fromStop = stops[index];
    var toStop = stops[index + 1];
    if (!fromStop || !toStop || !window.L) return 0;
    return L.latLng(fromStop.lat, fromStop.lng).distanceTo(L.latLng(toStop.lat, toStop.lng));
  };

  pr.routeFromOrsGeoJson = function(data, stops, profile) {
    var feature = data && data.features && data.features[0];
    var properties = feature && feature.properties ? feature.properties : {};
    var geometry = feature && feature.geometry ? feature.geometry : {};
    var coordinates = Array.isArray(geometry.coordinates) ? geometry.coordinates : [];
    var path = coordinates.map(function(coord) {
      return { lat: Number(coord[1]), lng: Number(coord[0]) };
    }).filter(function(point) {
      return isFinite(point.lat) && isFinite(point.lng);
    });

    var segments = Array.isArray(properties.segments) ? properties.segments : [];
    var legs = [];

    for (var i = 0; i < stops.length - 1; i++) {
      var fromStop = stops[i];
      var toStop = stops[i + 1];
      var segment = segments[i] || {};
      var segmentDistance = Number(segment.distance);
      var segmentDuration = Number(segment.duration);
      var legPath = pr.orsLegPath(path, segment.steps);

      if (!isFinite(segmentDistance) || segmentDistance <= 0) {
        segmentDistance = legPath.length > 1 ? pr.orsPathDistanceMeters(legPath) : pr.orsFallbackLegDistance(stops, i);
      }

      legs.push({
        fromIndex: i,
        toIndex: i + 1,
        fromLabel: fromStop ? fromStop.title : 'Stop ' + (i + 1),
        toLabel: toStop ? toStop.title : 'Stop ' + (i + 2),
        distanceMeters: segmentDistance,
        durationSeconds: isFinite(segmentDuration) && segmentDuration > 0 ? segmentDuration : 0,
        distanceText: pr.formatDistance(segmentDistance),
        durationText: isFinite(segmentDuration) && segmentDuration > 0 ? pr.formatDuration(segmentDuration) : '',
        providerDurationSeconds: isFinite(segmentDuration) && segmentDuration > 0 ? segmentDuration : 0,
        providerDurationText: isFinite(segmentDuration) && segmentDuration > 0 ? pr.formatDuration(segmentDuration) : '',
        providerProfile: profile,
        path: legPath
      });
    }

    return {
      providerId: pr.ROUTING_PROVIDERS.ors,
      providerLabel: pr.getRoutingProviderLabel(pr.ROUTING_PROVIDERS.ors),
      providerProfile: profile,
      travelMode: pr.getTravelMode(),
      legs: legs,
      totals: pr.calculateTotals(legs),
      path: path
    };
  };

  pr.calculateOrsRoute = function() {
    var stops = pr.getRouteStops();
    if (stops.length < 2) {
      pr.showMessage('Add at least two waypoints to calculate a route.');
      return;
    }

    if (!window.fetch) {
      pr.showMessage('OpenRouteService routing needs browser fetch support.');
      return;
    }

    var apiKey = pr.getOrsApiKey();
    var baseUrl = pr.getOrsBaseUrl();
    if (!baseUrl) {
      pr.showMessage('Set an OpenRouteService URL first.');
      return;
    }
    if (!apiKey && baseUrl.indexOf('api.openrouteservice.org') !== -1) {
      pr.showMessage('Set an OpenRouteService API key first.');
      return;
    }

    var profile = pr.orsProfileForTravelMode(pr.getTravelMode());
    var body = {
      coordinates: stops.map(function(stop) {
        return [Number(stop.lng), Number(stop.lat)];
      }),
      instructions: true,
      geometry: true,
      units: 'm'
    };

    var headers = {
      'Accept': 'application/geo+json, application/json',
      'Content-Type': 'application/json'
    };
    if (apiKey) headers.Authorization = apiKey;

    pr.setBusy(true);
    fetch(pr.orsRouteUrl(profile), {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    }).then(function(response) {
      return response.text().then(function(text) {
        var data = null;
        if (text) {
          try {
            data = JSON.parse(text);
          } catch (e) {
            data = { message: text };
          }
        }
        if (!response.ok) throw new Error(pr.orsErrorMessage(data, response.status));
        return data;
      });
    }).then(function(data) {
      var route = pr.routeFromOrsGeoJson(data, stops, profile);
      if (!route.path || route.path.length < 2 || !route.legs.length) {
        pr.showMessage('OpenRouteService returned no usable route.');
        return;
      }

      pr.state.route = route;
      pr.refreshRouteTravelEstimates(pr.state.route);
      pr.markRouteCurrent();

      var path = pr.state.route.path.map(function(point) {
        return L.latLng(point.lat, point.lng);
      });
      pr.drawRoutePath(path);
      pr.renderPanel();
      pr.renderMiniControl();
      if (pr.state.pointsPanelOpen) pr.renderPointsPanel();
      if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
    }, function(error) {
      pr.showMessage(error && error.message ? error.message : 'OpenRouteService route calculation failed.');
    }).then(function() {
      pr.setBusy(false);
    });
  };
