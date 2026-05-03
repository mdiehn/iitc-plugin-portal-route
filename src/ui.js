  pr.setBusy = function(isBusy) {
    var panel = document.getElementById(pr.DOM_IDS.dialogContent);
    if (panel) panel.classList.toggle('portal-route-busy', !!isBusy);
  };

  pr.showMessage = function(message) {
    var node = document.getElementById('portal-route-message') ||
      document.querySelector('#' + pr.DOM_IDS.routeLibraryContent + ' .portal-route-message') ||
      document.querySelector('#' + pr.DOM_IDS.pointsDialogContent + ' .portal-route-message');
    if (node) {
      node.textContent = message;
      node.classList.add('portal-route-message-visible');
      window.setTimeout(function() {
        node.classList.remove('portal-route-message-visible');
      }, 5000);
    } else {
      console.log('Portal Route:', message);
    }
  };

  pr.selectedMapPointIndex = function() {
    var index = pr.state.selectedMapPointIndex;
    var stop = typeof index === 'number' ? pr.state.stops[index] : null;

    if (stop && stop.type === 'map') return index;

    pr.state.selectedMapPointIndex = null;
    return -1;
  };

  pr.clearSelectedMapPoint = function() {
    if (pr.state.selectedMapPointIndex === null || pr.state.selectedMapPointIndex === undefined) return;
    pr.state.selectedMapPointIndex = null;
    pr.redrawLabels();
    pr.renderPanel();
    pr.renderMiniControl();
  };

  pr.selectedStopIndex = function() {
    var mapPointIndex = pr.selectedMapPointIndex();
    if (mapPointIndex >= 0) return mapPointIndex;

    var guid = window.selectedPortal;
    if (!guid) return -1;

    for (var i = 0; i < pr.state.stops.length; i++) {
      if (pr.state.stops[i].guid === guid) return i;
    }
    return -1;
  };

  pr.removeSelectedStop = function() {
    var index = pr.selectedStopIndex();
    if (index < 0) {
      pr.showMessage('Selected portal or map point is not in the route.');
      return;
    }
    pr.removeStop(index);
  };

  pr.removeSelectedPortal = pr.removeSelectedStop;

  pr.toggleSelectedPortalStop = function() {
    if (pr.selectedStopIndex() >= 0) {
      pr.removeSelectedStop();
    } else {
      pr.addSelectedPortal();
    }
  };

  pr.closeDialog = function() {
    var content = document.getElementById(pr.DOM_IDS.dialogContent);
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

  pr.closePointsDialog = function() {
    var content = document.getElementById(pr.DOM_IDS.pointsDialogContent);
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

  pr.listDropTarget = function(ev, item) {
    if (!item) return null;

    var targetIndex = Number(item.getAttribute('data-index'));
    if (!isFinite(targetIndex)) return null;

    var rect = item.getBoundingClientRect ? item.getBoundingClientRect() : null;
    var after = rect ? ev.clientY > rect.top + rect.height / 2 : false;
    var insertIndex = after ? targetIndex + 1 : targetIndex;

    if (targetIndex >= pr.state.stops.length) {
      insertIndex = pr.state.stops.length;
      after = false;
    }

    return {
      after: after,
      index: insertIndex
    };
  };

  pr.moveStopToInsertIndex = function(fromIndex, insertIndex) {
    if (!isFinite(fromIndex) || !isFinite(insertIndex)) return;
    if (fromIndex < 0 || fromIndex >= pr.state.stops.length) return;

    var toIndex = fromIndex < insertIndex ? insertIndex - 1 : insertIndex;
    toIndex = Math.min(Math.max(0, toIndex), pr.state.stops.length - 1);
    if (toIndex === fromIndex) return;

    pr.moveStop(fromIndex, toIndex);
  };

  pr.openMainPanel = function() {
    pr.state.panelOpen = true;
    pr.savePanelOpen();
    pr.renderPanel();
  };

  pr.handleAction = function(action, target) {
    if (pr.isLayerEnabled && !pr.isLayerEnabled()) {
      pr.syncLayerUi();
      return;
    }

    var index = target ? Number(target.getAttribute('data-index')) : -1;
    var actions = {
      'open-main': pr.openMainPanel,
      'open-route-menu': function() {
        if (!target || !target.getBoundingClientRect) {
          pr.openRouteMenu(20, 20);
          return;
        }
        var rect = target.getBoundingClientRect();
        pr.openRouteMenu(rect.left, rect.bottom + 4);
      },
      'open-edit': pr.openMainPanel,
      'close-panel': function() {
        pr.state.panelOpen = false;
        pr.savePanelOpen();
        pr.closeDialog();
      },
      'toggle-selected-stop': pr.toggleSelectedPortalStop,
      'smart-add': pr.smartAdd,
      'add-selected-stop': pr.addSelectedPortal,
      'add-map-point': function() { pr.setAddPointMode(!pr.state.addPointMode); },
      'add-current-location': pr.addCurrentLocation,
      'toggle-loop-back': pr.toggleLoopBackToStart,
      'reverse-route': pr.reverseRoute,
      'remove-stop': function() { pr.removeStop(index); },
      'rename-stop': function() { pr.renameStop(index); },
      'set-stop-start': function() { pr.moveStopToEdge(index, 'start'); },
      'set-stop-end': function() { pr.moveStopToEdge(index, 'end'); },
      'select-stop': function() { pr.selectStopPortal(index, false); },
      'select-stop-center': function() { pr.selectStopPortal(index, true); },
      'calculate-route': pr.calculateRoute,
      'fit-route': pr.fitRouteToMap,
      'open-google-maps': pr.openGoogleMaps,
      'save-route': pr.saveCurrentRouteToLibrary,
      'save-route-from-library': pr.saveCurrentRouteFromLibraryPanel,
      'load-route': pr.openRouteLibraryPanel,
      'load-selected-saved-route': function() {
        var route = pr.routeLibraryStorage().getRoute(pr.requireSingleSelectedLibraryRouteId());
        pr.applyRouteRecord(route);
      },
      'delete-selected-saved-route': function() { pr.deleteSelectedSavedRoutes(); },
      'export-selected-saved-route': function() { pr.exportSelectedSavedRoutesJson(); },
      'import-saved-route': pr.importSavedRouteJson,
      'export-route-library': pr.exportRouteLibraryJson,
      'import-route-library': pr.importRouteLibraryJson,
      'drive-connect': pr.chooseDriveRouteLibraryFolder,
      'drive-pull': pr.readDriveRouteLibrary,
      'drive-push': pr.pushDriveRouteLibrary,
      'export-route-json': pr.exportRouteJson,
      'import-route-json': pr.importRouteJson,
      'print-route': pr.printRoute,
      'open-points-list': function() {
        pr.state.pointsPanelOpen = true;
        pr.renderPointsPanel();
      },
      'clear-route': function() {
        pr.clearRouteWithConfirm();
      }
    };

    if (actions[action]) {
      pr.closeAddMenu();
      actions[action]();
    }
  };

  pr.isLayerEnabled = function() {
    if (!window.map || !pr.layerGroup) return true;
    return window.map.hasLayer(pr.layerGroup);
  };

  pr.createMiniControl = function() {
    if (!pr.state.settings.showMiniControl) return;
    if (!window.L || !window.map) return;
    if (pr.state.miniControl || document.getElementById(pr.DOM_IDS.miniControl)) return;

    var PortalRouteControl = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function() {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control portal-route-mini-control iitc-plugin-portal-route-control');
        container.id = pr.DOM_IDS.miniControl;
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);
        container.addEventListener('click', function(ev) {
          var button = ev.target.closest('[data-action]');
          if (!button) return;
          ev.preventDefault();
          if (pr.state.suppressNextAddClick && button.hasAttribute('data-add-menu')) {
            pr.state.suppressNextAddClick = false;
            return;
          }
          pr.handleAction(button.getAttribute('data-action'), button);
        });
        return container;
      }
    });

    pr.state.miniControl = new PortalRouteControl();
    window.map.addControl(pr.state.miniControl);
    pr.setMiniControlVisible(pr.isLayerEnabled());
  };

  pr.setMiniControlVisible = function(isVisible) {
    var container = document.getElementById(pr.DOM_IDS.miniControl);
    isVisible = !!isVisible && !!pr.state.settings.showMiniControl;
    if (container) container.style.display = isVisible ? '' : 'none';
  };

  pr.removeMiniControl = function() {
    if (pr.state.miniControl && window.map) {
      try {
        window.map.removeControl(pr.state.miniControl);
      } catch (e) {
        console.warn('Portal Route: unable to remove mini control', e);
      }
    }

    pr.state.miniControl = null;

    var container = document.getElementById(pr.DOM_IDS.miniControl);
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  pr.renderMiniControl = function() {
    if (!pr.state.settings.showMiniControl) {
      pr.setMiniControlVisible(false);
      return;
    }

    var container = document.getElementById(pr.DOM_IDS.miniControl);
    if (!container) return;

    if (!pr.isLayerEnabled()) {
      pr.setMiniControlVisible(false);
      return;
    }

    pr.setMiniControlVisible(true);

    var selectedInRoute = pr.selectedStopIndex() >= 0;
    var addRemoveClass = selectedInRoute ? ' portal-route-mini-remove' : '';
    var addRemoveText = selectedInRoute ? '-' : '+';
    var addRemoveTitle = selectedInRoute ? 'Remove selected waypoint from route' : 'Add to route';
    var addRemoveAction = selectedInRoute ? 'toggle-selected-stop' : 'smart-add';
    var loopClass = pr.state.settings.includeReturnToStart ? ' portal-route-mini-active' : '';
    var loopTitle = pr.state.settings.includeReturnToStart ? 'Turn off loop back to start' : 'Loop back to start';

    container.innerHTML = '' +
      '<a href="#" title="Open route in Google Maps" data-action="open-google-maps">M</a>' +
      '<a href="#" class="portal-route-mini-loop' + loopClass + '" title="' + loopTitle + '" data-action="toggle-loop-back">L</a>' +
      '<a href="#" class="portal-route-mini-add portal-route-smart-button' + addRemoveClass + '" title="' + addRemoveTitle + '" data-action="' + addRemoveAction + '" data-add-menu="true">' + addRemoveText + '</a>' +
      '<a href="#" title="Open points list" data-action="open-points-list">' + pr.state.stops.length + '</a>' +
      '<a href="#" class="portal-route-smart-button" title="Open Portal Route menu" data-action="open-route-menu">=</a>';
  };

  pr.panelForEvent = function(ev) {
    if (!ev.target || !ev.target.closest) return null;
    return ev.target.closest('#' + pr.DOM_IDS.dialogContent + ', #' + pr.DOM_IDS.pointsDialogContent + ', #' + pr.DOM_IDS.routeLibraryContent + ', .portal-route-context-menu');
  };

  pr.handleDialogClick = function(ev) {
    if (!ev.target.closest('.portal-route-context-menu')) pr.closeAddMenu();
    if (!pr.panelForEvent(ev)) return;

    var target = ev.target.closest('[data-action]');
    var action = target && target.getAttribute('data-action');
    if (!action) {
      var row = ev.target.closest('.portal-route-stop');
      if (!row || ev.target.closest('input, textarea, select')) return;
      ev.preventDefault();
      pr.selectStopPortal(Number(row.getAttribute('data-index')), false);
      return;
    }

    ev.preventDefault();
    if (pr.state.suppressNextAddClick && target.hasAttribute('data-add-menu')) {
      pr.state.suppressNextAddClick = false;
      return;
    }
    pr.handleAction(action, target);
  };

  pr.addMenuTarget = function(target) {
    return target && target.closest ? target.closest('[data-add-menu]') : null;
  };

  pr.closeAddMenu = function() {
    var menu = document.querySelector('.portal-route-context-menu');
    if (menu && menu.parentNode) menu.parentNode.removeChild(menu);
  };

  pr.openAddMenu = function(x, y) {
    pr.closeAddMenu();

    var menu = document.createElement('div');
    menu.className = 'portal-route-context-menu';
    menu.innerHTML = '' +
      '<button type="button" data-action="add-current-location">Add current location</button>' +
      '<button type="button" data-action="add-selected-stop"' + (window.selectedPortal ? '' : ' disabled') + '>Add selected portal</button>' +
      '<button type="button" data-action="add-map-point">Add point</button>' +
      '<div class="portal-route-context-divider"></div>' +
      '<button type="button" data-action="toggle-loop-back">' + (pr.state.settings.includeReturnToStart ? 'Unloop' : 'Loop') + '</button>' +
      '<button type="button" data-action="reverse-route"' + (pr.state.stops.length > 1 ? '' : ' disabled') + '>Reverse route</button>' +
      '<div class="portal-route-context-divider"></div>' +
      '<button type="button" data-action="clear-route"' + (pr.state.stops.length ? '' : ' disabled') + '>Clear route</button>';

    document.body.appendChild(menu);
    pr.positionContextMenu(menu, x, y);
  };

  pr.openRouteMenu = function(x, y) {
    pr.closeAddMenu();

    var menu = document.createElement('div');
    menu.className = 'portal-route-context-menu portal-route-nav-menu';
    menu.innerHTML = '' +
      '<button type="button" data-action="open-points-list">Route</button>' +
      '<button type="button" data-action="load-route">Library</button>' +
      '<button type="button" data-action="open-main">Settings</button>';

    document.body.appendChild(menu);
    pr.positionContextMenu(menu, x, y);
  };

  pr.positionContextMenu = function(menu, x, y) {
    var rect = menu.getBoundingClientRect();
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 320;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 480;
    menu.style.left = Math.max(6, Math.min(x, viewportWidth - rect.width - 6)) + 'px';
    menu.style.top = Math.max(6, Math.min(y, viewportHeight - rect.height - 6)) + 'px';
  };

  pr.openStopMenu = function(index, x, y) {
    pr.closeAddMenu();

    var stop = pr.getRouteStop(index);
    if (!stop || stop.generatedLoop) return;
    var isManagedStart = pr.isManagedStartStop(stop);

    var menu = document.createElement('div');
    menu.className = 'portal-route-context-menu';
    menu.innerHTML = '' +
      '<button type="button" data-action="remove-stop" data-index="' + index + '"' + (isManagedStart ? ' disabled' : '') + '>Delete</button>' +
      '<button type="button" data-action="rename-stop" data-index="' + index + '"' + (isManagedStart ? ' disabled' : '') + '>Rename</button>' +
      '<div class="portal-route-context-divider"></div>' +
      '<button type="button" data-action="set-stop-start" data-index="' + index + '"' + (isManagedStart ? ' disabled' : '') + '>Set as start</button>' +
      '<button type="button" data-action="set-stop-end" data-index="' + index + '"' + (isManagedStart ? ' disabled' : '') + '>Set as end</button>';

    document.body.appendChild(menu);
    pr.positionContextMenu(menu, x, y);
  };

  pr.handleStopMenuContext = function(ev) {
    var row = ev.target.closest('.portal-route-stop');
    if (!row || ev.target.closest('input, textarea, select')) return false;

    ev.preventDefault();
    pr.openStopMenu(Number(row.getAttribute('data-index')), ev.clientX || 12, ev.clientY || 12);
    return true;
  };

  pr.handleAddMenuContext = function(ev) {
    if (pr.handleStopMenuContext(ev)) return;

    var target = pr.addMenuTarget(ev.target);
    if (!target) return;

    ev.preventDefault();
    pr.openAddMenu(ev.clientX || 12, ev.clientY || 12);
  };

  pr.handleAddMenuTouchStart = function(ev) {
    var target = pr.addMenuTarget(ev.target);
    var row = ev.target.closest('.portal-route-stop');
    if ((!target && !row) || !window.setTimeout) return;

    if (pr.state.addMenuLongPressTimer) window.clearTimeout(pr.state.addMenuLongPressTimer);
    var touch = ev.touches && ev.touches[0];
    var x = touch ? touch.clientX : 12;
    var y = touch ? touch.clientY : 12;

    pr.state.addMenuLongPressTimer = window.setTimeout(function() {
      pr.state.addMenuLongPressTimer = null;
      pr.state.suppressNextAddClick = true;
      if (row && !ev.target.closest('input, textarea, select')) {
        pr.openStopMenu(Number(row.getAttribute('data-index')), x, y);
      } else {
        pr.openAddMenu(x, y);
      }
    }, 650);
  };

  pr.cancelAddMenuTouch = function() {
    if (!pr.state.addMenuLongPressTimer) return;
    window.clearTimeout(pr.state.addMenuLongPressTimer);
    pr.state.addMenuLongPressTimer = null;
  };

  pr.handleDialogDragStart = function(ev) {
    if (!pr.panelForEvent(ev)) return;

    var item = ev.target.closest('.portal-route-stop');
    if (!item) return;
    if (ev.target.closest('.portal-route-wait-cell')) {
      ev.preventDefault();
      return;
    }

    pr.state.dragStopIndex = Number(item.getAttribute('data-index'));
    if (!isFinite(pr.state.dragStopIndex)) {
      pr.state.dragStopIndex = null;
      ev.preventDefault();
      return;
    }

    ev.dataTransfer.effectAllowed = 'move';
    ev.dataTransfer.setData('text/plain', String(pr.state.dragStopIndex));
    item.classList.add('portal-route-dragging');
  };

  pr.handleDialogDragEnd = function(ev) {
    var item = ev.target.closest('.portal-route-stop');
    if (item) item.classList.remove('portal-route-dragging');
    document.querySelectorAll('.portal-route-drop-target').forEach(function(row) {
      row.classList.remove('portal-route-drop-target', 'portal-route-drop-after');
    });
    pr.state.dragStopIndex = null;
  };

  pr.handleDialogDragOver = function(ev) {
    if (!pr.panelForEvent(ev)) return;

    var item = ev.target.closest('.portal-route-stop');
    if (!item) return;
    if (pr.state.dragStopIndex === null || pr.state.dragStopIndex === undefined) return;

    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    document.querySelectorAll('.portal-route-drop-target').forEach(function(row) {
      if (row !== item) row.classList.remove('portal-route-drop-target', 'portal-route-drop-after');
    });
    var dropTarget = pr.listDropTarget(ev, item);
    item.classList.add('portal-route-drop-target');
    item.classList.toggle('portal-route-drop-after', !!(dropTarget && dropTarget.after));
  };

  pr.handleDialogDrop = function(ev) {
    if (!pr.panelForEvent(ev)) return;

    var item = ev.target.closest('.portal-route-stop');
    if (!item) return;

    ev.preventDefault();
    item.classList.remove('portal-route-drop-target', 'portal-route-drop-after');

    var fromIndex = pr.state.dragStopIndex;
    var dropTarget = pr.listDropTarget(ev, item);
    pr.state.dragStopIndex = null;

    if (!dropTarget) return;
    pr.moveStopToInsertIndex(fromIndex, dropTarget.index);
  };

  pr.handleDialogSettingChange = function(target) {
    var field = target && target.getAttribute('data-field');
    if (field === 'start-on-current-location') {
      pr.setStartOnCurrentLocation(!!target.checked);
      return true;
    }

    if (field === 'include-return-to-start') {
      pr.setLoopBackToStart(!!target.checked);
      return true;
    }

    if (field === 'show-segment-times-on-map') {
      pr.state.settings.showSegmentTimesOnMap = !!target.checked;
      pr.saveSettings();
      pr.redrawSegmentTimeLabels();
      return true;
    }

    if (field === 'show-mini-control') {
      pr.state.settings.showMiniControl = !!target.checked;
      pr.saveSettings();
      if (pr.state.settings.showMiniControl) {
        pr.createMiniControl();
        pr.renderMiniControl();
      } else {
        pr.removeMiniControl();
      }
      return true;
    }

    if (field === 'show-portal-details-controls') {
      pr.state.settings.showPortalDetailsControls = !!target.checked;
      pr.saveSettings();
      if (pr.state.settings.showPortalDetailsControls) {
        pr.injectPortalDetailsAction();
      } else {
        pr.removePortalDetailsAction();
      }
      return true;
    }

    return false;
  };

  pr.handleDialogFieldChange = function(ev) {
    if (!pr.panelForEvent(ev)) return;

    var target = ev.target;
    var field = target && target.getAttribute('data-field');
    if (pr.handleDialogSettingChange(target)) return;

    if (field === 'default-stop-minutes') {
      var value = pr.parseDurationMinutes(target.value);
      if (value === null) {
        pr.showMessage('Invalid duration. Use values like 15m, 1.5h, or 2d.');
        target.value = pr.formatDurationInput(pr.state.settings.defaultStopMinutes);
        return;
      }

      pr.state.settings.defaultStopMinutes = value;
      pr.saveSettings();
      pr.markRouteStale();
      pr.renderPanel();
    } else if (field === 'stop-minutes') {
      var stopIndex = Number(target.getAttribute('data-index'));
      var stopValue = pr.parseDurationMinutes(target.value);
      if (stopValue === null) {
        pr.showMessage('Invalid duration. Use values like 15m, 1.5h, or 2d.');
        target.value = pr.formatDurationInput(pr.getEffectiveStopMinutes(pr.state.stops[stopIndex]));
        return;
      }

      pr.setStopMinutes(stopIndex, stopValue);
    } else if (field === 'saved-route-name') {
      var routeId = target.getAttribute('data-route-id');
      var previous = pr.routeLibraryStorage().getRoute(routeId);
      if (!pr.setSavedRouteName(routeId, target.value) && previous) {
        target.value = previous.name || '';
      }
    } else if (field === 'selected-library-route') {
      pr.setLibraryRouteSelected(target.getAttribute('data-route-id'), target.checked);
      pr.refreshRouteLibraryPanel();
    } else if (field === 'route-library-backend') {
      pr.setRouteLibraryBackend(target.value);
    }
  };

  pr.setupDialogEventHandlers = function() {
    if (pr.dialogEventsRegistered) return;
    pr.dialogEventsRegistered = true;

    document.addEventListener('click', pr.handleDialogClick);
    document.addEventListener('dragstart', pr.handleDialogDragStart);
    document.addEventListener('dragend', pr.handleDialogDragEnd);
    document.addEventListener('dragover', pr.handleDialogDragOver);
    document.addEventListener('drop', pr.handleDialogDrop);
    document.addEventListener('change', pr.handleDialogFieldChange);
    document.addEventListener('contextmenu', pr.handleAddMenuContext);
    document.addEventListener('touchstart', pr.handleAddMenuTouchStart);
    document.addEventListener('touchend', pr.cancelAddMenuTouch);
    document.addEventListener('touchcancel', pr.cancelAddMenuTouch);
    document.addEventListener('touchmove', pr.cancelAddMenuTouch);
  };

  pr.addToolboxLink = function() {
    if (!document.getElementById('toolbox')) return;
    if (document.getElementById(pr.DOM_IDS.toolboxLink)) return;

    var link = document.createElement('a');
    link.id = pr.DOM_IDS.toolboxLink;
    link.href = '#';
    link.textContent = 'Portal Route';
    link.addEventListener('click', function(ev) {
      ev.preventDefault();
      if (!pr.isLayerEnabled()) return;
      pr.openMainPanel();
    });

    var toolbox = document.getElementById('toolbox');
    toolbox.appendChild(link);
  };

  pr.removeToolboxLink = function() {
    var link = document.getElementById(pr.DOM_IDS.toolboxLink);
    if (link && link.parentNode) {
      link.parentNode.removeChild(link);
    }
  };

  pr.injectCss = function() {
    if (document.getElementById(pr.DOM_IDS.css)) return;
    var style = document.createElement('style');
    style.id = pr.DOM_IDS.css;
    style.textContent = pr.CSS;
    document.head.appendChild(style);
  };


  pr.setupLayerControl = function() {
    if (pr.layerGroup) return;

    pr.layerGroup = L.FeatureGroup ? new L.FeatureGroup() : L.layerGroup();

    if (typeof window.addLayerGroup === 'function') {
      window.addLayerGroup('Portal Route', pr.layerGroup, true);
    } else if (window.layerChooser && typeof window.layerChooser.addOverlay === 'function') {
      window.layerChooser.addOverlay(pr.layerGroup, 'Portal Route');
      pr.layerGroup.addTo(window.map);
    }
  };

  pr.syncLayerUi = function() {
    if (pr.isLayerEnabled()) {
      pr.addToolboxLink();
      if (pr.state.settings.showMiniControl) {
        pr.createMiniControl();
      } else {
        pr.removeMiniControl();
      }
      pr.setMiniControlVisible(true);
      pr.renderMiniControl();
      return;
    }

    pr.state.panelOpen = false;
    pr.savePanelOpen();
    pr.closeDialog();
    pr.state.pointsPanelOpen = false;
    pr.closePointsDialog();
    pr.setMiniControlVisible(false);
    pr.removeToolboxLink();
  };

  pr.enable = function() {
    pr.addToolboxLink();
    if (pr.state.settings.showMiniControl) pr.createMiniControl();
    pr.setMiniControlVisible(true);
    pr.renderMiniControl();
    pr.redrawLabels();
  };

  pr.disable = function() {
    pr.state.panelOpen = false;
    pr.savePanelOpen();
    pr.closeDialog();
    pr.state.pointsPanelOpen = false;
    pr.closePointsDialog();
    pr.setMiniControlVisible(false);
    pr.removeToolboxLink();
  };

  pr.setupLayerEvents = function() {
    if (pr.layerEventsRegistered) return;
    if (!window.map || !pr.layerGroup) return;

    window.map.on('layeradd', function(e) {
      if (e.layer !== pr.layerGroup) return;
      pr.enable();
    });

    window.map.on('layerremove', function(e) {
      if (e.layer !== pr.layerGroup) return;
      pr.disable();
    });

    pr.layerEventsRegistered = true;
  };

  pr.setupMapPointEvents = function() {
    if (pr.mapPointEventsRegistered) return;
    if (!window.map) return;

    window.map.on('click', function(e) {
      if (!pr.state.addPointMode) return;
      if (pr.isLayerEnabled && !pr.isLayerEnabled()) return;

      pr.state.addPointMode = false;
      pr.addMapPointAtLatLng(e.latlng);
      pr.showMessage('Map point added.');
    });

    pr.mapPointEventsRegistered = true;
  };

  pr.setup = function() {
    try {
      if (plugin_info && plugin_info.script && plugin_info.script.version) {
        pr.VERSION = plugin_info.script.version;
      }

      pr.injectCss();
      pr.loadState();
      pr.setupLayerControl();
      pr.setupLayerEvents();
      pr.createMiniControl();
      pr.setupDialogEventHandlers();
      pr.setupMapPointEvents();
      pr.addToolboxLink();
      pr.syncLayerUi();
      pr.renderPanel();
      pr.renderMiniControl();
      pr.redrawLabels();
      pr.redrawRouteLine();
      if (!pr.state.route || pr.state.routeDirty) pr.queueRouteCalculationIfReady();
      pr.injectPortalDetailsAction();

      if (typeof window.addHook === 'function' && !pr.portalHookRegistered) {
        window.addHook('portalDetailsUpdated', function() {
          pr.clearSelectedMapPoint();
          pr.injectPortalDetailsAction();
          pr.renderMiniControl();
        });
        pr.portalHookRegistered = true;
      }

      console.log('Portal Route setup complete');
    } catch (e) {
      console.error('Portal Route setup failed:', e);
    }
  };
