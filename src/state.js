  pr.normalizeSettings = function(settings) {
    var normalized = Object.assign({}, pr.DEFAULT_SETTINGS);
    if (!settings || typeof settings !== 'object') return normalized;

    Object.keys(pr.DEFAULT_SETTINGS).forEach(function(key) {
      var defaultValue = pr.DEFAULT_SETTINGS[key];
      var value = settings[key];

      if (typeof defaultValue === 'boolean') {
        if (typeof value === 'boolean') normalized[key] = value;
        return;
      }

      if (typeof defaultValue === 'number') {
        value = Number(value);
        if (isFinite(value) && value >= 0) normalized[key] = Math.round(value);
      }
    });

    return normalized;
  };

  pr.state = {
    stops: [],
    route: null,
    routeDirty: false,
    settings: pr.normalizeSettings(),
    layers: {
      labels: null,
      routeLine: null,
      segmentLabels: null
    },
    panelOpen: false,
    panelPosition: null,
    panelSize: null,
    pointsPanelOpen: false,
    addPointMode: false,
    selectedMapPointIndex: null,
    activeRouteId: null,
    routeLibraryBackendId: 'local',
    selectedLibraryRouteIds: [],
    miniControl: null
  };

  pr.getEffectiveStopMinutes = function(stop) {
    if (stop && typeof stop.stopMinutes === 'number' && !Number.isNaN(stop.stopMinutes)) {
      return stop.stopMinutes;
    }
    return pr.state.settings.defaultStopMinutes;
  };
