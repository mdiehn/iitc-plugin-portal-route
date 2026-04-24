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
