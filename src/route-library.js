  pr.ROUTE_LIBRARY_SCHEMA_VERSION = 1;

  pr.routeLibraryNow = function() {
    return new Date().toISOString();
  };

  pr.newRouteLibraryId = function() {
    return 'route-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  };

  pr.getMapSnapshot = function() {
    if (!window.map || !window.map.getCenter || !window.map.getZoom) return null;

    var center = window.map.getCenter();
    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') return null;

    return {
      center: {
        lat: center.lat,
        lng: center.lng
      },
      zoom: window.map.getZoom()
    };
  };

  pr.routeLibrarySettings = function() {
    return {
      defaultStopMinutes: pr.state.settings.defaultStopMinutes,
      includeReturnToStart: !!pr.state.settings.includeReturnToStart
    };
  };

  pr.serializeRouteLibraryStops = function() {
    return pr.state.stops.map(function(stop) {
      return {
        guid: stop.guid || null,
        type: stop.type || (stop.guid ? 'portal' : 'map'),
        title: stop.title || ((stop.type || (stop.guid ? 'portal' : 'map')) === 'map' ? 'Map point' : 'Unnamed portal'),
        lat: Number(stop.lat),
        lng: Number(stop.lng),
        stopMinutes: typeof stop.stopMinutes === 'number' ? stop.stopMinutes : null,
        startOnMe: !!stop.startOnMe,
        accuracy: typeof stop.accuracy === 'number' ? stop.accuracy : null,
        updatedAt: stop.updatedAt || null
      };
    });
  };

  pr.suggestRouteName = function() {
    if (pr.state.stops.length) {
      var first = pr.state.stops[0] && pr.state.stops[0].title ? pr.state.stops[0].title : 'Route';
      return first + ' route';
    }
    return 'New route';
  };

  pr.makeRouteRecord = function(existing, name) {
    var now = pr.routeLibraryNow();
    var record = existing && typeof existing === 'object' ? existing : {};

    return {
      schemaVersion: pr.ROUTE_LIBRARY_SCHEMA_VERSION,
      pluginVersion: pr.VERSION,
      id: record.id || pr.newRouteLibraryId(),
      name: name || record.name || pr.suggestRouteName(),
      createdAt: record.createdAt || now,
      updatedAt: now,
      map: pr.getMapSnapshot(),
      route: {
        stops: pr.serializeRouteLibraryStops()
      },
      settings: pr.routeLibrarySettings()
    };
  };

  pr.emptyRouteLibrary = function() {
    return {
      schemaVersion: pr.ROUTE_LIBRARY_SCHEMA_VERSION,
      routes: []
    };
  };

  pr.loadRouteLibrary = function() {
    var raw = localStorage.getItem(pr.STORAGE_KEYS.routeLibrary);
    if (!raw) return pr.emptyRouteLibrary();

    try {
      var library = JSON.parse(raw);
      if (!library || typeof library !== 'object' || !Array.isArray(library.routes)) {
        return pr.emptyRouteLibrary();
      }

      library.schemaVersion = library.schemaVersion || pr.ROUTE_LIBRARY_SCHEMA_VERSION;
      return library;
    } catch (e) {
      console.warn('Portal Route: failed to load route library', e);
      return pr.emptyRouteLibrary();
    }
  };

  pr.saveRouteLibrary = function(library) {
    localStorage.setItem(pr.STORAGE_KEYS.routeLibrary, JSON.stringify(library));
  };

  pr.findLibraryRoute = function(library, id) {
    if (!library || !Array.isArray(library.routes) || !id) return null;
    for (var i = 0; i < library.routes.length; i++) {
      if (library.routes[i] && library.routes[i].id === id) return library.routes[i];
    }
    return null;
  };

  pr.storageBackends = pr.storageBackends || {};

  pr.localRouteStorage = {
    id: 'local',
    label: 'This browser',
    listRoutes: function() {
      return pr.loadRouteLibrary().routes.slice().sort(function(a, b) {
        return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      });
    },
    getRoute: function(id) {
      return pr.findLibraryRoute(pr.loadRouteLibrary(), id);
    },
    saveRoute: function(route) {
      var library = pr.loadRouteLibrary();
      var replaced = false;

      library.routes = library.routes.map(function(existing) {
        if (existing && existing.id === route.id) {
          replaced = true;
          return route;
        }
        return existing;
      });

      if (!replaced) library.routes.push(route);
      pr.saveRouteLibrary(library);
      return route;
    }
  };

  pr.storageBackends.local = pr.localRouteStorage;

  pr.promptRouteName = function(defaultName) {
    if (!window.prompt) return defaultName || pr.suggestRouteName();

    var name = window.prompt('Route name', defaultName || pr.suggestRouteName());
    if (name === null) return null;

    name = String(name).trim();
    return name || pr.suggestRouteName();
  };

  pr.saveCurrentRouteToLibrary = function() {
    if (!pr.state.stops.length) {
      pr.showMessage('No route to save.');
      return;
    }

    var existing = pr.localRouteStorage.getRoute(pr.state.activeRouteId);
    var name = pr.promptRouteName(existing && existing.name);
    if (name === null) return;

    var record = pr.makeRouteRecord(existing, name);
    pr.localRouteStorage.saveRoute(record);
    pr.state.activeRouteId = record.id;
    pr.showMessage('Route saved.');
  };

  pr.applyRouteLibrarySettings = function(settings) {
    if (!settings || typeof settings !== 'object') return;

    if (typeof settings.defaultStopMinutes === 'number' && isFinite(settings.defaultStopMinutes) && settings.defaultStopMinutes >= 0) {
      pr.state.settings.defaultStopMinutes = Math.round(settings.defaultStopMinutes);
    }

    if (typeof settings.includeReturnToStart === 'boolean') {
      pr.state.settings.includeReturnToStart = settings.includeReturnToStart;
    }
  };

  pr.applyRouteRecord = function(record) {
    if (!record || record.schemaVersion !== pr.ROUTE_LIBRARY_SCHEMA_VERSION) {
      pr.showMessage('Saved route is not compatible.');
      return false;
    }

    var route = record.route || {};
    if (!Array.isArray(route.stops)) {
      pr.showMessage('Saved route has no stops.');
      return false;
    }

    var stops = route.stops.map(pr.normalizeImportedStop).filter(Boolean);
    if (stops.length !== route.stops.length) {
      pr.showMessage('Saved route has invalid stops.');
      return false;
    }

    pr.state.stops = stops;
    pr.applyRouteLibrarySettings(record.settings);
    pr.state.route = null;
    pr.state.routeDirty = false;
    pr.state.selectedMapPointIndex = null;
    pr.state.activeRouteId = record.id || null;

    pr.saveSettings();
    pr.saveStops();
    pr.saveRoute();
    pr.clearRouteLine();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    pr.hydrateStopTitles();

    if (record.map && record.map.center && window.map && window.map.setView &&
        typeof record.map.center.lat === 'number' &&
        typeof record.map.center.lng === 'number' &&
        typeof record.map.zoom === 'number') {
      window.map.setView([record.map.center.lat, record.map.center.lng], record.map.zoom);
    }

    pr.showMessage('Route loaded.');
    return true;
  };

  pr.closeRouteLibraryPanel = function() {
    var content = document.getElementById(pr.DOM_IDS.routeLibraryContent);
    if (content && window.jQuery) {
      try {
        window.jQuery(content).closest('.ui-dialog-content').dialog('close');
        return;
      } catch (e) {
        // Fall through to hiding the content if the dialog wrapper is unavailable.
      }
    }
    if (content) content.style.display = 'none';
  };

  pr.renderRouteLibraryRows = function(routes) {
    if (!routes.length) {
      return '<p class="portal-route-empty">No saved routes.</p>';
    }

    var html = '<div class="portal-route-library-list">';
    routes.forEach(function(route) {
      var stopCount = route.route && Array.isArray(route.route.stops) ? route.route.stops.length : 0;
      html += '<div class="portal-route-library-row">';
      html += '<div class="portal-route-library-info">';
      html += '<strong>' + pr.escapeHtml(route.name || 'Unnamed route') + '</strong>';
      html += '<span>' + stopCount + ' stops - ' + pr.escapeHtml(route.updatedAt || '') + '</span>';
      html += '</div>';
      html += '<button type="button" data-action="load-saved-route" data-route-id="' + pr.escapeHtml(route.id) + '">Load</button>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  };

  pr.openRouteLibraryPanel = function() {
    var routes = pr.localRouteStorage.listRoutes();
    var contentHtml = '<div class="portal-route-dialog-content portal-route-library-dialog-content" id="' + pr.DOM_IDS.routeLibraryContent + '" tabindex="-1">';
    contentHtml += '<div class="portal-route-library-source">Stored in: This browser</div>';
    contentHtml += pr.renderRouteLibraryRows(routes);
    contentHtml += '</div>';

    if (typeof window.dialog === 'function') {
      window.dialog({
        id: pr.DOM_IDS.routeLibrary,
        title: 'Load Route',
        html: contentHtml,
        dialogClass: 'portal-route-dialog portal-route-library-dialog',
        width: pr.getDialogWidth()
      });

      var content = document.getElementById(pr.DOM_IDS.routeLibraryContent);
      if (content && pr.focusPanelContainer) pr.focusPanelContainer(content);
    } else {
      console.log('Portal Route: IITC dialog API is unavailable.');
    }
  };
