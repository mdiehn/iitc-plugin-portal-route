  pr.markRouteStale = function(options) {
    options = options || {};
    var hadRouteState = !!pr.state.route || !!pr.state.routeDirty;
    var hasRouteableStops = pr.getRouteStops().length >= 2;
    var shouldAutoReplot = hasRouteableStops && !options.skipAutoReplot;
    pr.state.routeDirty = hadRouteState || hasRouteableStops;

    if (options.clearRoute && !shouldAutoReplot) {
      pr.state.route = null;
      pr.clearRouteLine();
    } else if (pr.state.route && pr.state.route.legs) {
      pr.state.route.totals = pr.calculateTotals(pr.state.route.legs);
    }

    if (pr.applyRouteLineStyle) pr.applyRouteLineStyle();
    pr.saveRoute();
    if (shouldAutoReplot) pr.queueAutoReplot();
  };

  pr.queueAutoReplot = function() {
    if (!pr.calculateRoute || !window.setTimeout) return;
    if (pr.state.autoReplotTimer) window.clearTimeout(pr.state.autoReplotTimer);

    pr.state.autoReplotTimer = window.setTimeout(function() {
      pr.state.autoReplotTimer = null;
      if (!pr.state.routeDirty) return;
      pr.calculateRoute();
    }, 0);
  };

  pr.queueRouteCalculationIfReady = function() {
    if (pr.getRouteStops().length < 2) return false;
    pr.state.routeDirty = true;
    pr.saveRoute();
    pr.queueAutoReplot();
    return true;
  };

  pr.markRouteCurrent = function() {
    pr.state.routeDirty = false;
    if (pr.applyRouteLineStyle) pr.applyRouteLineStyle();
    pr.saveRoute();
  };

  pr.isManagedStartStop = function(stop) {
    return !!(stop && stop.startOnMe && pr.state.settings.startOnCurrentLocation);
  };

  pr.isManagedStartIndex = function(index) {
    return pr.isManagedStartStop(pr.state.stops[index]);
  };

  pr.findStartOnMeIndex = function() {
    for (var i = 0; i < pr.state.stops.length; i++) {
      if (pr.state.stops[i] && pr.state.stops[i].startOnMe) return i;
    }
    return -1;
  };

  pr.makeLoopStop = function() {
    if (!pr.state.settings.includeReturnToStart) return null;
    if (!pr.state.stops.length) return null;

    var first = pr.state.stops[0];
    return {
      guid: first.guid || null,
      type: 'loop',
      title: first.title || 'Start',
      lat: first.lat,
      lng: first.lng,
      stopMinutes: 0,
      generatedLoop: true,
      linkedStopIndex: 0,
      linkedStopGuid: first.guid || null
    };
  };

  pr.getRouteStops = function() {
    var stops = pr.state.stops.slice();
    var loopStop = pr.makeLoopStop();
    if (loopStop && stops.length > 1) stops.push(loopStop);
    return stops;
  };

  pr.getRouteStop = function(index) {
    return pr.getRouteStops()[index] || null;
  };

  pr.currentLocationStopFromPosition = function(position, options) {
    options = options || {};
    var coords = position && position.coords;
    if (!coords || typeof coords.latitude !== 'number' || typeof coords.longitude !== 'number') return null;

    return {
      guid: null,
      type: 'map',
      title: options.title || 'Current location',
      lat: coords.latitude,
      lng: coords.longitude,
      stopMinutes: options.startOnMe ? 0 : null,
      startOnMe: !!options.startOnMe,
      accuracy: typeof coords.accuracy === 'number' ? coords.accuracy : null,
      updatedAt: new Date().toISOString()
    };
  };

  pr.getCurrentLocation = function(onSuccess, onError) {
    if (!window.navigator || !navigator.geolocation) {
      if (onError) onError(new Error('Geolocation is not available.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function(position) { onSuccess(position); },
      function(error) {
        if (onError) onError(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    );
  };

  pr.applyStartOnCurrentLocation = function(position, options) {
    options = options || {};
    var stop = pr.currentLocationStopFromPosition(position, { startOnMe: true });
    if (!stop) {
      pr.showMessage('Could not read current location.');
      return false;
    }

    if (!options.skipUndo && pr.pushUndoSnapshot) pr.pushUndoSnapshot('update start location');

    var selectedIndex = pr.state.selectedMapPointIndex;
    var selectedStop = typeof selectedIndex === 'number' ? pr.state.stops[selectedIndex] : null;
    var existingIndex = pr.findStartOnMeIndex();
    var existingStop = existingIndex >= 0 ? pr.state.stops[existingIndex] : null;

    if (existingStop) {
      Object.assign(existingStop, stop);
      pr.state.stops.splice(existingIndex, 1);
      pr.state.stops.unshift(existingStop);
    } else {
      pr.state.stops.unshift(stop);
    }

    if (selectedStop) {
      var newSelectedIndex = pr.state.stops.indexOf(selectedStop);
      pr.state.selectedMapPointIndex = newSelectedIndex >= 0 ? newSelectedIndex : null;
    }

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
    return true;
  };

  pr.setStartOnCurrentLocation = function(enabled) {
    enabled = !!enabled;
    if (enabled !== !!pr.state.settings.startOnCurrentLocation && pr.pushUndoSnapshot) {
      pr.pushUndoSnapshot(enabled ? 'enable start on me' : 'disable start on me');
    }

    pr.state.settings.startOnCurrentLocation = enabled;
    pr.saveSettings();

    if (!enabled) {
      pr.renderPanel();
      return;
    }

    pr.showMessage('Getting current location...');
    pr.getCurrentLocation(
      function(position) {
        if (!pr.state.settings.startOnCurrentLocation) return;
        if (pr.applyStartOnCurrentLocation(position, { skipUndo: true })) {
          pr.showMessage('Start set to current location.');
        }
      },
      function(error) {
        pr.state.settings.startOnCurrentLocation = false;
        pr.saveSettings();
        pr.renderPanel();
        pr.showMessage('Could not get current location' + (error && error.message ? ': ' + error.message : '.'));
      }
    );
  };

  pr.setLoopBackToStart = function(enabled) {
    enabled = !!enabled;
    if (enabled !== !!pr.state.settings.includeReturnToStart && pr.pushUndoSnapshot) {
      pr.pushUndoSnapshot(enabled ? 'enable loop' : 'disable loop');
    }

    pr.state.settings.includeReturnToStart = enabled;
    pr.saveSettings();
    pr.markRouteStale({ clearRoute: true });
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
  };

  pr.toggleLoopBackToStart = function() {
    pr.setLoopBackToStart(!pr.state.settings.includeReturnToStart);
  };

  pr.addCurrentLocation = function() {
    pr.showMessage('Getting current location...');
    pr.getCurrentLocation(
      function(position) {
        var stop = pr.currentLocationStopFromPosition(position, { title: 'Current location' });
        if (!stop) {
          pr.showMessage('Could not read current location.');
          return;
        }
        delete stop.startOnMe;
        pr.addStop(stop);
        pr.showMessage('Current location added.');
      },
      function(error) {
        pr.showMessage('Could not get current location' + (error && error.message ? ': ' + error.message : '.'));
      }
    );
  };

  pr.smartAdd = function() {
    if (window.selectedPortal && pr.portalToStop && pr.portalToStop(window.selectedPortal)) {
      pr.addSelectedPortal();
      return;
    }

    pr.setAddPointMode(true);
  };

  pr.stopTitleNeedsHydration = function(title) {
    var cleanTitle = String(title == null ? '' : title).trim();
    return !cleanTitle ||
      cleanTitle.toLowerCase().indexOf('unknown') === 0 ||
      cleanTitle === 'Unnamed portal' ||
      /^Portal \d+$/.test(cleanTitle);
  };

  pr.portalTitleFromGuid = function(guid) {
    var portal = guid && window.portals && window.portals[guid];
    var data = portal && portal.options && portal.options.data ? portal.options.data : null;
    if (!data) return null;
    return data.title || data.name || null;
  };

  pr.portalDetailTitle = function(details) {
    if (!details) return null;
    var data = details.details || details.portalDetails || details.portalData || details;
    return data.title || data.name || null;
  };

  pr.applyPortalTitleFromDetails = function(guid, details) {
    var title = pr.portalDetailTitle(details);
    var changed = false;

    if (!guid || pr.stopTitleNeedsHydration(title)) return false;

    pr.state.stops.forEach(function(stop) {
      if (!stop || stop.guid !== guid) return;
      if (!pr.stopTitleNeedsHydration(stop.title)) return;

      stop.title = String(title).trim();
      changed = true;
    });

    return changed;
  };

  pr.requestPortalDetailTitle = function(guid, onDone) {
    var existingTitle = pr.portalTitleFromGuid(guid);
    if (existingTitle) {
      onDone(guid, { title: existingTitle });
      return;
    }

    if (!window.portalDetail || typeof window.portalDetail.request !== 'function') {
      onDone(guid, null);
      return;
    }

    try {
      var request = window.portalDetail.request(guid);
      if (request && typeof request.done === 'function') {
        request
          .done(function(details) { onDone(guid, details); })
          .fail(function() { onDone(guid, null); });
      } else if (request && typeof request.then === 'function') {
        request.then(
          function(details) { onDone(guid, details); },
          function() { onDone(guid, null); }
        );
      } else {
        onDone(guid, null);
      }
    } catch (e) {
      console.warn('Portal Route: unable to load portal details for ' + guid, e);
      onDone(guid, null);
    }
  };

  pr.hydrateStopTitles = function() {
    var seen = {};
    var guids = pr.state.stops.filter(function(stop) {
      if (!stop || !stop.guid) return false;
      if (!pr.stopTitleNeedsHydration(stop.title)) return false;
      if (seen[stop.guid]) return false;
      seen[stop.guid] = true;
      return true;
    }).map(function(stop) {
      return stop.guid;
    });

    if (!guids.length) return;

    var index = 0;
    var changedCount = 0;
    var finishedCount = 0;
    var maxActive = 2;
    var active = 0;

    pr.showMessage('Loading portal names...');

    var finishOne = function(guid, details) {
      active -= 1;
      finishedCount += 1;

      if (pr.applyPortalTitleFromDetails(guid, details)) {
        changedCount += 1;
        pr.saveStops();
        pr.redrawLabels();
        pr.renderPanel();
        pr.renderMiniControl();
        if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
      }

      if (finishedCount >= guids.length) {
        pr.showMessage(changedCount
          ? 'Loaded names for ' + changedCount + ' portals.'
          : 'No portal names found.');
        return;
      }

      runNext();
    };

    var runNext = function() {
      while (active < maxActive && index < guids.length) {
        var guid = guids[index];
        index += 1;
        active += 1;
        pr.requestPortalDetailTitle(guid, finishOne);
      }
    };

    runNext();
  };

  pr.stopGuidFromData = function(stop) {
    return stop.guid || stop.portalGuid || stop.portal_guid || null;
  };

  pr.stopRawTitleFromData = function(stop) {
    return stop.title || stop.portalTitle || stop.portal_title || stop.name || stop.label || '';
  };

  pr.hydratedStopTitle = function(stop, stopType, index) {
    var rawTitle = pr.stopRawTitleFromData(stop);
    if (!pr.stopTitleNeedsHydration(rawTitle)) return String(rawTitle).trim();

    if (stopType !== 'map') {
      var portalTitle = pr.portalTitleFromGuid(pr.stopGuidFromData(stop));
      if (portalTitle) return portalTitle;
      return typeof index === 'number' ? 'Portal ' + (index + 1) : 'Unnamed portal';
    }

    return typeof index === 'number' ? 'Map point ' + (index + 1) : 'Map point';
  };

  pr.addStop = function(stop) {
    if (!stop || typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return;

    var guid = pr.stopGuidFromData(stop);
    var stopType = stop.type || (guid ? 'portal' : 'map');
    var title = pr.hydratedStopTitle(stop, stopType, pr.state.stops.length);

    if (guid && pr.state.stops.some(function(existing) { return existing.guid === guid; })) {
      pr.showMessage('Already in route: ' + title);
      return;
    }

    if (pr.pushUndoSnapshot) pr.pushUndoSnapshot('add waypoint');

    pr.state.stops.push({
      guid: guid,
      type: stopType,
      title: title,
      lat: stop.lat,
      lng: stop.lng,
      stopMinutes: typeof stop.stopMinutes === 'number' ? stop.stopMinutes : null,
      startOnMe: !!stop.startOnMe,
      accuracy: typeof stop.accuracy === 'number' ? stop.accuracy : null,
      updatedAt: stop.updatedAt || null
    });

    if (stopType === 'map') {
      pr.state.selectedMapPointIndex = pr.state.stops.length - 1;
      if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
    }

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
  };

  pr.nextMapPointTitle = function() {
    var count = pr.state.stops.filter(function(stop) {
      return stop && stop.type === 'map' && !stop.startOnMe;
    }).length + 1;
    return 'Map point ' + count;
  };

  pr.addMapPointAtLatLng = function(latlng) {
    if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') return;

    pr.addStop({
      type: 'map',
      title: pr.nextMapPointTitle(),
      lat: latlng.lat,
      lng: latlng.lng
    });
  };

  pr.updateMapPointPosition = function(index, latlng, options) {
    options = options || {};
    if (index < 0 || index >= pr.state.stops.length) return false;
    if (!latlng || typeof latlng.lat !== 'number' || typeof latlng.lng !== 'number') return false;

    var stop = pr.state.stops[index];
    if (!stop || stop.type !== 'map') return false;
    if (pr.isManagedStartStop(stop)) return false;

    if (!options.live && !options.skipUndo && pr.pushUndoSnapshot) pr.pushUndoSnapshot('move waypoint');

    stop.lat = latlng.lat;
    stop.lng = latlng.lng;

    if (options.live) return true;

    pr.state.selectedMapPointIndex = index;
    pr.markRouteStale();
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
    return true;
  };

  pr.replaceStopLocation = function(index, replacement) {
    if (index < 0 || index >= pr.state.stops.length) return false;
    if (!replacement || typeof replacement.lat !== 'number' || typeof replacement.lng !== 'number') return false;

    var existing = pr.state.stops[index];
    if (!existing || pr.isManagedStartStop(existing)) return false;

    var guid = pr.stopGuidFromData(replacement);
    if (guid && pr.state.stops.some(function(stop, stopIndex) {
      return stopIndex !== index && stop && stop.guid === guid;
    })) {
      pr.showMessage('Already in route: ' + pr.hydratedStopTitle(replacement, 'portal', index));
      return false;
    }

    var stopType = replacement.type || (guid ? 'portal' : 'map');
    var title = pr.hydratedStopTitle(replacement, stopType, index);

    if (pr.pushUndoSnapshot) pr.pushUndoSnapshot('move waypoint');

    pr.state.stops[index] = Object.assign({}, existing, {
      guid: guid,
      type: stopType,
      title: title,
      lat: replacement.lat,
      lng: replacement.lng,
      startOnMe: false,
      accuracy: typeof replacement.accuracy === 'number' ? replacement.accuracy : null,
      updatedAt: replacement.updatedAt || null
    });

    if (stopType === 'map') {
      pr.state.selectedMapPointIndex = index;
      if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
    } else {
      pr.state.selectedMapPointIndex = null;
      window.selectedPortal = guid;
      if (typeof window.renderPortalDetails === 'function') {
        try {
          window.renderPortalDetails(guid);
        } catch (e) {
          console.warn('Portal Route: unable to render replacement portal details', e);
        }
      }
    }

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
    return true;
  };

  pr.syncAddPointModeUi = function() {
    var mapContainer = window.map && window.map.getContainer ? window.map.getContainer() : null;
    if (mapContainer && mapContainer.classList) {
      mapContainer.classList.toggle('portal-route-add-point-mode', !!pr.state.addPointMode);
    }
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
  };

  pr.setAddPointMode = function(enabled) {
    pr.state.addPointMode = !!enabled;
    pr.syncAddPointModeUi();
    pr.showMessage(pr.state.addPointMode ? 'Click or tap the map to add a point.' : 'Add point canceled.');
  };

  pr.removeStop = function(index) {
    if (index < 0 || index >= pr.state.stops.length) return;
    if (pr.isManagedStartIndex(index)) {
      pr.showMessage('Untick Start on me before removing that point.');
      return;
    }

    if (pr.pushUndoSnapshot) pr.pushUndoSnapshot('delete waypoint');

    if (pr.state.selectedMapPointIndex === index) {
      pr.state.selectedMapPointIndex = null;
    } else if (pr.state.selectedMapPointIndex > index) {
      pr.state.selectedMapPointIndex -= 1;
    }

    pr.state.stops.splice(index, 1);
    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
  };

  pr.clearStops = function() {
    var restoreStartOnMe = !!pr.state.settings.startOnCurrentLocation;
    if ((pr.state.stops.length || pr.state.route || pr.state.routeDirty) && pr.pushUndoSnapshot) {
      pr.pushUndoSnapshot('clear route');
    }

    pr.state.stops = [];
    pr.state.route = null;
    pr.state.routeDirty = false;
    pr.state.selectedMapPointIndex = null;
    pr.state.activeRouteId = null;
    pr.saveStops();
    pr.saveRoute();
    pr.clearRouteLine();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();

    if (restoreStartOnMe) {
      pr.setStartOnCurrentLocation(true);
    }
  };

  pr.clearRouteWithConfirm = function() {
    if (pr.state.stops.length && window.confirm && !window.confirm('Clear all points from the route?')) return;
    pr.clearStops();
  };

  pr.reverseRoute = function() {
    if (pr.state.stops.length < 2) {
      pr.showMessage('Add at least two waypoints to reverse.');
      return;
    }

    if (pr.pushUndoSnapshot) pr.pushUndoSnapshot('reverse route');

    var selectedStop = typeof pr.state.selectedMapPointIndex === 'number' ? pr.state.stops[pr.state.selectedMapPointIndex] : null;
    var pinnedStart = pr.isManagedStartIndex(0) ? pr.state.stops.slice(0, 1) : [];
    var routeStops = pr.state.stops.slice(pinnedStart.length).reverse();

    pr.state.stops = pinnedStart.concat(routeStops);
    pr.state.selectedMapPointIndex = selectedStop ? pr.state.stops.indexOf(selectedStop) : null;
    if (pr.state.selectedMapPointIndex < 0) pr.state.selectedMapPointIndex = null;

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
    pr.showMessage('Route reversed.');
  };

  pr.renameStop = function(index) {
    if (index < 0 || index >= pr.state.stops.length) return;
    var stop = pr.state.stops[index];
    if (!stop || pr.isManagedStartStop(stop)) return;

    var title = window.prompt ? window.prompt('Waypoint name', stop.title || '') : null;
    if (title === null) return;

    title = String(title).trim();
    if (!title) title = stop.type === 'map' ? pr.nextMapPointTitle() : 'Unnamed portal';

    if (title !== stop.title && pr.pushUndoSnapshot) pr.pushUndoSnapshot('rename waypoint');

    stop.title = title;
    pr.saveStops();
    pr.redrawLabels();
    pr.redrawSegmentTimeLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
  };

  pr.moveStopToEdge = function(index, edge) {
    if (index < 0 || index >= pr.state.stops.length) return;
    if (pr.isManagedStartIndex(index)) return;

    var toIndex = edge === 'end' ? pr.state.stops.length - 1 : 0;
    if (edge === 'start' && pr.state.settings.startOnCurrentLocation) toIndex = 1;
    pr.moveStop(index, toIndex);
  };

  pr.replaceStops = function(stops, options) {
    options = options || {};
    if (!Array.isArray(stops)) return;
    if (!options.skipUndo && pr.pushUndoSnapshot) pr.pushUndoSnapshot('replace route');

    pr.state.stops = [];
    pr.state.route = null;
    pr.state.routeDirty = false;
    pr.state.selectedMapPointIndex = null;
    pr.state.activeRouteId = null;

    stops.forEach(function(stop) {
      if (!stop || typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return;
      var guid = pr.stopGuidFromData(stop);
      var stopType = stop.type || (guid ? 'portal' : 'map');
      pr.state.stops.push({
        guid: guid,
        type: stopType,
        title: pr.hydratedStopTitle(stop, stopType, pr.state.stops.length),
        lat: stop.lat,
        lng: stop.lng,
        stopMinutes: typeof stop.stopMinutes === 'number' ? stop.stopMinutes : null,
        startOnMe: !!stop.startOnMe,
        accuracy: typeof stop.accuracy === 'number' ? stop.accuracy : null,
        updatedAt: stop.updatedAt || null
      });
    });

    pr.saveStops();
    pr.saveRoute();
    pr.clearRouteLine();
    pr.redrawLabels();
    if (options.openPanel || options.openPointsPanel) {
      pr.state.pointsPanelOpen = true;
    }
    pr.renderPanel();
    pr.renderPointsPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
    pr.showMessage('Imported ' + pr.state.stops.length + ' stops.');
    pr.hydrateStopTitles();
  };

  pr.moveStop = function(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= pr.state.stops.length) return;
    if (toIndex < 0 || toIndex >= pr.state.stops.length) return;
    if (fromIndex === toIndex) return;
    if (pr.isManagedStartIndex(fromIndex)) return;
    if (pr.state.settings.startOnCurrentLocation && toIndex === 0) toIndex = 1;
    if (fromIndex === toIndex) return;

    if (pr.pushUndoSnapshot) pr.pushUndoSnapshot('move waypoint');

    var selectedIndex = pr.state.selectedMapPointIndex;
    var item = pr.state.stops.splice(fromIndex, 1)[0];
    pr.state.stops.splice(toIndex, 0, item);

    if (selectedIndex === fromIndex) {
      pr.state.selectedMapPointIndex = toIndex;
    } else if (selectedIndex !== null && selectedIndex !== undefined) {
      if (fromIndex < selectedIndex && selectedIndex <= toIndex) {
        pr.state.selectedMapPointIndex -= 1;
      } else if (toIndex <= selectedIndex && selectedIndex < fromIndex) {
        pr.state.selectedMapPointIndex += 1;
      }
    }

    pr.markRouteStale({ clearRoute: true });
    pr.saveStops();
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
  };


  pr.setStopTitle = function(index, title) {
    if (index < 0 || index >= pr.state.stops.length) return;

    var stop = pr.state.stops[index];
    if (!stop || stop.type !== 'map') return;
    if (pr.isManagedStartStop(stop)) return;

    var cleanTitle = String(title == null ? '' : title).trim();
    if (!cleanTitle) cleanTitle = pr.nextMapPointTitle();

    if (cleanTitle !== stop.title && pr.pushUndoSnapshot) pr.pushUndoSnapshot('rename waypoint');

    stop.title = cleanTitle;
    pr.saveStops();
    pr.redrawLabels();
    pr.redrawSegmentTimeLabels();
    pr.renderPanel();
  };


  pr.setStopMinutes = function(index, minutes) {
    if (index < 0 || index >= pr.state.stops.length) return;
    if (pr.isManagedStartIndex(index)) return;
    if (typeof minutes !== 'number' || !isFinite(minutes) || minutes < 0) return;

    minutes = Math.round(minutes);
    if (pr.state.stops[index].stopMinutes === minutes) return;
    if (pr.pushUndoSnapshot) pr.pushUndoSnapshot('change wait time');

    pr.state.stops[index].stopMinutes = minutes;
    pr.markRouteStale();
    pr.saveStops();
    pr.renderPanel();
  };

  pr.parseDurationMinutes = function(text) {
    var match = String(text == null ? '' : text).trim().toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([mhd]?)$/);
    if (!match) return null;

    var value = Number(match[1]);
    var unit = match[2] || 'm';

    if (!isFinite(value) || value < 0) return null;

    if (unit === 'm') return Math.round(value);
    if (unit === 'h') return Math.round(value * 60);
    if (unit === 'd') return Math.round(value * 24 * 60);

    return null;
  };

  pr.formatDurationInput = function(minutes) {
    minutes = Math.max(0, Math.round(Number(minutes || 0)));

    if (minutes && minutes % 1440 === 0) return (minutes / 1440) + 'd';
    if (minutes && minutes % 60 === 0) return (minutes / 60) + 'h';
    return minutes + 'm';
  };

  pr.selectStopPortal = function(index, center) {
    var stop = pr.getRouteStop(index);
    if (!stop) return;

    if (stop.generatedLoop) {
      if (center && window.map) {
        window.map.setView([stop.lat, stop.lng], window.map.getZoom());
      }
      pr.showMessage('Loop endpoint returns to the first waypoint.');
      return;
    }

    if (!stop.guid) {
      pr.state.selectedMapPointIndex = index;
      if (pr.clearIitcPortalSelection) pr.clearIitcPortalSelection();
      if (center && window.map) {
        window.map.setView([stop.lat, stop.lng], window.map.getZoom());
      }
      pr.redrawLabels();
      pr.renderPanel();
      pr.renderMiniControl();
      if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
      return;
    }

    pr.state.selectedMapPointIndex = null;

    var portal = window.portals && window.portals[stop.guid];
    if (center && portal && portal.getLatLng && window.map) {
      window.map.setView(portal.getLatLng(), window.map.getZoom());
    }

    if (typeof window.renderPortalDetails === 'function') {
      window.renderPortalDetails(stop.guid);
    } else {
      window.selectedPortal = stop.guid;
    }

    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
    if (pr.injectPortalDetailsAction) pr.injectPortalDetailsAction();
  };


  pr.calculateTotals = function(legs) {
    var driveSeconds = 0;
    var distanceMeters = 0;

    legs.forEach(function(leg) {
      driveSeconds += leg.durationSeconds || 0;
      distanceMeters += leg.distanceMeters || 0;
    });

    var stopSeconds = pr.state.stops.reduce(function(sum, stop) {
      return sum + pr.getEffectiveStopMinutes(stop) * 60;
    }, 0);

    return {
      driveSeconds: driveSeconds,
      stopSeconds: stopSeconds,
      tripSeconds: driveSeconds + stopSeconds,
      distanceMeters: distanceMeters
    };
  };
