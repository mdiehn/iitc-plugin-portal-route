  dr.loadState = function() {
    try {
      var rawSettings = localStorage.getItem(dr.STORAGE_KEYS.settings);
      if (rawSettings) {
        dr.state.settings = Object.assign({}, dr.DEFAULT_SETTINGS, JSON.parse(rawSettings));
      }

      var rawStops = localStorage.getItem(dr.STORAGE_KEYS.stops);
      if (rawStops) {
        var stops = JSON.parse(rawStops);
        if (Array.isArray(stops)) dr.state.stops = stops;
      }

      var rawPanelOpen = localStorage.getItem(dr.STORAGE_KEYS.panelOpen);
      if (rawPanelOpen !== null) dr.state.panelOpen = rawPanelOpen === 'true';

      var rawRoute = localStorage.getItem(dr.STORAGE_KEYS.route);
      if (rawRoute) {
        var route = JSON.parse(rawRoute);
        if (route && Array.isArray(route.legs)) dr.state.route = route;
      }

      var rawRouteDirty = localStorage.getItem(dr.STORAGE_KEYS.routeDirty);
      if (rawRouteDirty !== null) dr.state.routeDirty = rawRouteDirty === 'true';
    } catch (e) {
      console.warn('Driving Route: failed to load saved state', e);
    }
  };

  dr.saveSettings = function() {
    localStorage.setItem(dr.STORAGE_KEYS.settings, JSON.stringify(dr.state.settings));
  };

  dr.saveStops = function() {
    localStorage.setItem(dr.STORAGE_KEYS.stops, JSON.stringify(dr.state.stops));
  };

  dr.savePanelOpen = function() {
    localStorage.setItem(dr.STORAGE_KEYS.panelOpen, String(dr.state.panelOpen));
  };


  dr.saveRoute = function() {
    if (dr.state.route) {
      localStorage.setItem(dr.STORAGE_KEYS.route, JSON.stringify(dr.state.route));
    } else {
      localStorage.removeItem(dr.STORAGE_KEYS.route);
    }
    localStorage.setItem(dr.STORAGE_KEYS.routeDirty, String(!!dr.state.routeDirty));
  };

  dr.clearSavedRoute = function() {
    localStorage.removeItem(dr.STORAGE_KEYS.route);
    localStorage.removeItem(dr.STORAGE_KEYS.routeDirty);
  };
