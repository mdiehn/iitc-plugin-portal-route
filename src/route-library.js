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

  pr.normalizeRouteRecord = function(record, options) {
    options = options || {};
    if (!record || typeof record !== 'object') return null;
    if (record.schemaVersion !== pr.ROUTE_LIBRARY_SCHEMA_VERSION) return null;

    var route = record.route || {};
    if (!Array.isArray(route.stops)) return null;

    var stops = route.stops.map(pr.normalizeImportedStop).filter(Boolean);
    if (stops.length !== route.stops.length) return null;

    var now = pr.routeLibraryNow();
    var id = options.newId ? pr.newRouteLibraryId() : (record.id || pr.newRouteLibraryId());
    var name = String(record.name || 'Imported route').trim() || 'Imported route';
    if (options.nameSuffix) name += ' ' + options.nameSuffix;

    return {
      schemaVersion: pr.ROUTE_LIBRARY_SCHEMA_VERSION,
      pluginVersion: record.pluginVersion || pr.VERSION,
      id: id,
      name: name,
      createdAt: options.newId ? now : (record.createdAt || now),
      updatedAt: options.keepUpdatedAt ? (record.updatedAt || now) : now,
      map: record.map && typeof record.map === 'object' ? record.map : null,
      route: {
        stops: stops
      },
      settings: record.settings && typeof record.settings === 'object' ? record.settings : {}
    };
  };

  pr.prepareImportedRouteRecord = function(record, library) {
    var id = record && record.id;
    var duplicate = !!pr.findLibraryRoute(library, id);
    return pr.normalizeRouteRecord(record, {
      newId: duplicate,
      nameSuffix: duplicate ? 'imported' : '',
      keepUpdatedAt: !duplicate
    });
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
    },
    deleteRoute: function(id) {
      var library = pr.loadRouteLibrary();
      var before = library.routes.length;
      library.routes = library.routes.filter(function(route) {
        return route && route.id !== id;
      });
      pr.saveRouteLibrary(library);
      return library.routes.length !== before;
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
      return null;
    }

    var existing = pr.localRouteStorage.getRoute(pr.state.activeRouteId);
    var name = pr.promptRouteName(existing && existing.name);
    if (name === null) return null;

    var record = pr.makeRouteRecord(existing, name);
    pr.localRouteStorage.saveRoute(record);
    pr.state.activeRouteId = record.id;
    pr.showMessage('Route saved.');
    return record;
  };

  pr.saveCurrentRouteAsNewLibraryRoute = function() {
    if (!pr.state.stops.length) {
      pr.showMessage('No route to save.');
      return null;
    }

    var name = pr.promptRouteName(pr.suggestRouteName());
    if (name === null) return null;

    var record = pr.makeRouteRecord(null, name);
    pr.localRouteStorage.saveRoute(record);
    pr.state.activeRouteId = record.id;
    pr.state.selectedLibraryRouteIds = [record.id];
    pr.refreshRouteLibraryPanel();
    pr.showMessage('Route saved.');
    return record;
  };

  pr.saveCurrentRouteFromLibraryPanel = function() {
    var ids = pr.getSelectedLibraryRouteIds();
    if (ids.length > 1) {
      pr.showMessage('Select one route to overwrite, or uncheck routes to save new.');
      return;
    }

    if (ids.length === 1) {
      pr.updateSavedRouteFromCurrent(ids[0]);
      return;
    }

    pr.saveCurrentRouteAsNewLibraryRoute();
  };

  pr.setSavedRouteName = function(id, name) {
    var library = pr.loadRouteLibrary();
    var route = pr.findLibraryRoute(library, id);
    if (!route) {
      pr.showMessage('Saved route not found.');
      return false;
    }

    name = String(name == null ? '' : name).trim();
    if (!name) {
      pr.showMessage('Route name cannot be empty.');
      return false;
    }

    route.name = name;
    route.updatedAt = pr.routeLibraryNow();
    pr.saveRouteLibrary(library);
    pr.showMessage('Route renamed.');
    return true;
  };

  pr.deleteSavedRoute = function(id) {
    if (!id) return;
    var route = pr.localRouteStorage.getRoute(id);
    if (!route) {
      pr.showMessage('Saved route not found.');
      return;
    }

    if (window.confirm && !window.confirm('Delete saved route "' + (route.name || 'Unnamed route') + '"?')) return;

    if (pr.localRouteStorage.deleteRoute(id)) {
      if (pr.state.activeRouteId === id) pr.state.activeRouteId = null;
      pr.refreshRouteLibraryPanel();
      pr.showMessage('Route deleted.');
    }
  };

  pr.updateSavedRouteFromCurrent = function(id) {
    if (!id) return;
    if (!pr.state.stops.length) {
      pr.showMessage('No route to save.');
      return;
    }

    var existing = pr.localRouteStorage.getRoute(id);
    if (!existing) {
      pr.showMessage('Saved route not found.');
      return;
    }

    if (window.confirm && !window.confirm('Overwrite "' + (existing.name || 'Unnamed route') + '" with current route?')) return;

    var record = pr.makeRouteRecord(existing, existing.name);
    pr.localRouteStorage.saveRoute(record);
    pr.state.activeRouteId = record.id;
    pr.refreshRouteLibraryPanel();
    pr.showMessage('Route updated.');
  };

  pr.getSelectedLibraryRouteIds = function() {
    var library = pr.loadRouteLibrary();
    var ids = Array.isArray(pr.state.selectedLibraryRouteIds) ? pr.state.selectedLibraryRouteIds : [];
    var selected = ids.filter(function(id, index) {
      return ids.indexOf(id) === index && !!pr.findLibraryRoute(library, id);
    });

    if (selected.length !== ids.length) pr.state.selectedLibraryRouteIds = selected;
    return selected;
  };

  pr.setLibraryRouteSelected = function(id, selected) {
    if (!id) return;
    var ids = pr.getSelectedLibraryRouteIds();
    var index = ids.indexOf(id);

    if (selected && index === -1) ids.push(id);
    if (!selected && index !== -1) ids.splice(index, 1);

    pr.state.selectedLibraryRouteIds = ids;
  };

  pr.requireSingleSelectedLibraryRouteId = function() {
    var ids = pr.getSelectedLibraryRouteIds();
    if (ids.length !== 1) {
      pr.showMessage('Select one route first.');
      return null;
    }
    return ids[0];
  };

  pr.requireSelectedLibraryRouteIds = function() {
    var ids = pr.getSelectedLibraryRouteIds();
    if (!ids.length) {
      pr.showMessage('Select a route first.');
      return null;
    }
    return ids;
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
    pr.state.routeDirty = stops.length >= 2;
    pr.state.selectedMapPointIndex = null;
    pr.state.activeRouteId = record.id || null;

    pr.saveSettings();
    pr.saveStops();
    pr.saveRoute();
    pr.clearRouteLine();
    pr.redrawLabels();
    pr.renderPanel();
    if (pr.state.pointsPanelOpen) pr.renderPointsPanel();
    pr.renderMiniControl();
    pr.queueRouteCalculationIfReady();
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

  pr.routeRecordFilename = function(route) {
    var safeName = String(route && route.name ? route.name : 'route')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'route';
    return 'portal-route-' + safeName + '.json';
  };

  pr.routeLibraryFilename = function() {
    var stamp = new Date().toISOString().replace(/[:.]/g, '-');
    return 'portal-route-library-' + stamp + '.json';
  };

  pr.exportSavedRouteJson = function(id) {
    if (!id) return;
    var route = pr.localRouteStorage.getRoute(id);
    if (!route) {
      pr.showMessage('Saved route not found.');
      return;
    }

    pr.downloadTextFile(pr.routeRecordFilename(route), JSON.stringify(route, null, 2), 'application/json');
    pr.showMessage('Saved route exported.');
  };

  pr.exportRouteLibraryJson = function() {
    var library = pr.loadRouteLibrary();
    pr.exportRouteLibraryRoutesJson(library.routes, 'Route library exported.');
  };

  pr.exportRouteLibraryRoutesJson = function(routes, message) {
    var data = {
      schemaVersion: pr.ROUTE_LIBRARY_SCHEMA_VERSION,
      plugin: pr.ID,
      pluginVersion: pr.VERSION,
      exportedAt: pr.routeLibraryNow(),
      routes: routes
    };

    pr.downloadTextFile(pr.routeLibraryFilename(), JSON.stringify(data, null, 2), 'application/json');
    pr.showMessage(message || 'Route library exported.');
  };

  pr.exportSelectedSavedRoutesJson = function() {
    var ids = pr.requireSelectedLibraryRouteIds();
    if (!ids) return;

    var library = pr.loadRouteLibrary();
    var routes = ids.map(function(id) {
      return pr.findLibraryRoute(library, id);
    }).filter(Boolean);

    if (routes.length === 1) {
      pr.exportSavedRouteJson(routes[0].id);
      return;
    }

    pr.exportRouteLibraryRoutesJson(routes, routes.length + ' saved routes exported.');
  };

  pr.deleteSelectedSavedRoutes = function() {
    var ids = pr.requireSelectedLibraryRouteIds();
    if (!ids) return;

    if (ids.length === 1) {
      pr.deleteSavedRoute(ids[0]);
      return;
    }

    if (window.confirm && !window.confirm('Delete ' + ids.length + ' saved routes?')) return;

    var library = pr.loadRouteLibrary();
    var idMap = {};
    ids.forEach(function(id) { idMap[id] = true; });
    library.routes = library.routes.filter(function(route) {
      return route && !idMap[route.id];
    });
    pr.saveRouteLibrary(library);

    if (idMap[pr.state.activeRouteId]) pr.state.activeRouteId = null;
    pr.state.selectedLibraryRouteIds = [];
    pr.refreshRouteLibraryPanel();
    pr.showMessage(ids.length + ' routes deleted.');
  };

  pr.readJsonFile = function(onData, onError) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    input.addEventListener('change', function() {
      var file = input.files && input.files[0];
      if (!file) {
        if (input.parentNode) input.parentNode.removeChild(input);
        return;
      }

      var reader = new FileReader();
      reader.onload = function() {
        try {
          onData(JSON.parse(String(reader.result || '')));
        } catch (e) {
          if (onError) onError(e);
        }
        if (input.parentNode) input.parentNode.removeChild(input);
      };
      reader.onerror = function() {
        if (onError) onError(new Error('Unable to read file.'));
        if (input.parentNode) input.parentNode.removeChild(input);
      };
      reader.readAsText(file);
    });

    document.body.appendChild(input);
    input.click();
  };

  pr.importSavedRouteRecord = function(record) {
    var library = pr.loadRouteLibrary();
    var imported = pr.prepareImportedRouteRecord(record, library);
    if (!imported) throw new Error('JSON is not a compatible saved route.');

    library.routes.push(imported);
    pr.saveRouteLibrary(library);
    pr.refreshRouteLibraryPanel();
    pr.showMessage('Saved route imported.');
  };

  pr.importSavedRouteJson = function() {
    pr.readJsonFile(function(data) {
      try {
        pr.importSavedRouteRecord(data);
      } catch (e) {
        console.warn('Portal Route: saved route import failed', e);
        pr.showMessage('Route import failed: ' + e.message);
      }
    }, function(e) {
      pr.showMessage('Route import failed: ' + e.message);
    });
  };

  pr.importRouteLibraryData = function(data) {
    if (!data || typeof data !== 'object') throw new Error('Import data is not an object.');
    if (data.schemaVersion !== pr.ROUTE_LIBRARY_SCHEMA_VERSION) throw new Error('Route library version is not compatible.');
    if (!Array.isArray(data.routes)) throw new Error('Import data does not contain routes.');

    var library = pr.loadRouteLibrary();
    var added = 0;

    data.routes.forEach(function(route) {
      var imported = pr.prepareImportedRouteRecord(route, library);
      if (!imported) return;
      library.routes.push(imported);
      added += 1;
    });

    pr.saveRouteLibrary(library);
    pr.refreshRouteLibraryPanel();
    pr.showMessage(added ? 'Imported ' + added + ' saved routes.' : 'No routes imported.');
  };

  pr.importRouteLibraryJson = function() {
    pr.readJsonFile(function(data) {
      try {
        pr.importRouteLibraryData(data);
      } catch (e) {
        console.warn('Portal Route: route library import failed', e);
        pr.showMessage('Library import failed: ' + e.message);
      }
    }, function(e) {
      pr.showMessage('Library import failed: ' + e.message);
    });
  };

  pr.renderRouteLibraryRows = function(routes) {
    if (!routes.length) {
      return '<p class="portal-route-empty">No saved routes.</p>';
    }

    var html = '<div class="portal-route-library-list">';
    var selectedIds = pr.getSelectedLibraryRouteIds();
    routes.forEach(function(route) {
      var stopCount = route.route && Array.isArray(route.route.stops) ? route.route.stops.length : 0;
      var selected = selectedIds.indexOf(route.id) !== -1;
      html += '<div class="portal-route-library-row' + (selected ? ' portal-route-library-row-selected' : '') + '">';
      html += '<label class="portal-route-library-select" title="Select route"><input type="checkbox" data-field="selected-library-route" data-route-id="' + pr.escapeHtml(route.id) + '"' + (selected ? ' checked' : '') + '></label>';
      html += '<div class="portal-route-library-info">';
      html += '<input type="text" class="portal-route-library-name-input" value="' + pr.escapeHtml(route.name || 'Unnamed route') + '" data-field="saved-route-name" data-route-id="' + pr.escapeHtml(route.id) + '" title="Edit route name">';
      html += '<span>' + stopCount + ' stops - ' + pr.escapeHtml(route.updatedAt || '') + '</span>';
      html += '</div>';
      html += '</div>';
    });
    html += '</div>';
    return html;
  };

  pr.renderRouteLibraryContent = function() {
    var routes = pr.localRouteStorage.listRoutes();
    var selectedCount = pr.getSelectedLibraryRouteIds().length;
    var singleDisabled = selectedCount === 1 ? '' : ' disabled';
    var saveDisabled = selectedCount <= 1 ? '' : ' disabled';
    var anyDisabled = selectedCount ? '' : ' disabled';
    var contentHtml = '';
    contentHtml += '<div class="portal-route-library-source">Stored in: This browser</div>';
    contentHtml += '<div class="portal-route-control-group-buttons portal-route-library-toolbar">';
    contentHtml += '<button type="button" data-action="export-route-library">Export Library</button>';
    contentHtml += '<button type="button" data-action="import-route-library">Import Library</button>';
    contentHtml += '</div>';
    contentHtml += pr.renderRouteLibraryRows(routes);
    if (selectedCount === 1) {
      contentHtml += '<div class="portal-route-library-tip">' + selectedCount + ' route selected. Save will overwrite it after confirmation.</div>';
    } else if (selectedCount > 1) {
      contentHtml += '<div class="portal-route-library-tip portal-route-library-tip-active">Select one route to load or save over. Export/Delete can use multiple.</div>';
    } else {
      contentHtml += '<div class="portal-route-library-tip portal-route-library-tip-active">Save creates a new route. Select one route to load or overwrite.</div>';
    }
    contentHtml += '<div class="portal-route-control-group-buttons portal-route-footer-actions portal-route-library-actions">';
    contentHtml += '<button type="button" data-action="save-route-from-library"' + saveDisabled + '>Save</button>';
    contentHtml += '<button type="button" data-action="load-selected-saved-route"' + singleDisabled + '>Load</button>';
    contentHtml += '<button type="button" data-action="import-saved-route">Import</button>';
    contentHtml += '<button type="button" data-action="export-selected-saved-route"' + anyDisabled + '>Export</button>';
    contentHtml += '<button type="button" data-action="delete-selected-saved-route"' + anyDisabled + '>Delete</button>';
    contentHtml += '</div>';
    return contentHtml;
  };

  pr.refreshRouteLibraryPanel = function() {
    var content = document.getElementById(pr.DOM_IDS.routeLibraryContent);
    if (!content || !pr.isDialogOpen || !pr.isDialogOpen(content)) {
      pr.openRouteLibraryPanel();
      return;
    }

    content.innerHTML = pr.renderRouteLibraryContent();
  };

  pr.openRouteLibraryPanel = function() {
    var contentHtml = '<div class="portal-route-dialog-content portal-route-library-dialog-content" id="' + pr.DOM_IDS.routeLibraryContent + '" tabindex="-1">';
    contentHtml += pr.renderRouteLibraryContent();
    contentHtml += '</div>';

    if (typeof window.dialog === 'function') {
      window.dialog({
        id: pr.DOM_IDS.routeLibrary,
        title: 'Route Library',
        html: contentHtml,
        dialogClass: 'portal-route-dialog portal-route-library-dialog',
        width: pr.getRouteLibraryDialogWidth(),
        height: pr.getRouteLibraryDialogHeight()
      });

      var content = document.getElementById(pr.DOM_IDS.routeLibraryContent);
      if (content && pr.focusPanelContainer) pr.focusPanelContainer(content);
    } else {
      console.log('Portal Route: IITC dialog API is unavailable.');
    }
  };
