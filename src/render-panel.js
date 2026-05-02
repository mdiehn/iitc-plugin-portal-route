  pr.escapeHtml = function(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  pr.renderEmptyHelp = function() {
    return '<p class="portal-route-empty">There are no waypoints defined.<br>Select a portal and use Add Portal, Add Point, or Add Me.</p>';
  };

  pr.renderRouteSegment = function(leg) {
    if (!leg) {
      return '<span class="portal-route-leg portal-route-leg-empty">---- / ----</span>';
    }

    var duration = leg.durationText || pr.formatDuration(leg.durationSeconds);
    var distance = leg.distanceText || pr.formatDistance(leg.distanceMeters);
    var staleClass = pr.state.routeDirty ? ' portal-route-leg-stale' : '';

    return '<span class="portal-route-leg' + staleClass + '">' +
      pr.escapeHtml(duration) +
      ' / ' +
      pr.escapeHtml(distance) +
      '</span>';
  };

  pr.renderStopsList = function(legsByToIndex) {
    var stops = pr.getRouteStops();
    var realStops = pr.state.stops;
    if (stops.length === 0) return pr.renderEmptyHelp();

    var html = '';
    html += '<div class="portal-route-waypoints-list">';

    stops.forEach(function(stop, index) {
      var isLoop = !!stop.generatedLoop;
      var isManagedStart = pr.isManagedStartStop(stop);
      var waitValue = isLoop ? '0m' : pr.formatDurationInput(pr.getEffectiveStopMinutes(stop));
      var selectedClass = !isLoop && pr.selectedStopIndex && pr.selectedStopIndex() === index ? ' portal-route-selected-stop' : '';
      var rowClass = selectedClass + (isLoop ? ' portal-route-loop-row' : '');
      var badge = isLoop ? 'L' : (index + 1);
      var badgeClass = String(badge).length > 2 ? ' portal-route-waypoint-badge-wide' : '';
      var canDragRow = !isLoop && !isManagedStart;
      var dragClass = canDragRow ? ' portal-route-waypoint-row-draggable' : '';
      var dragAttr = canDragRow ? ' draggable="true"' : '';
      var dragHandleAttr = canDragRow ? ' draggable="true"' : '';
      var selectTitle = isLoop ? 'Loop back to start' : 'Select and center stop';
      var badgeTitle = canDragRow ? 'Drag to reorder; click to select and center' : selectTitle;

      html += '<div class="portal-route-waypoint-row portal-route-stop' + rowClass + dragClass + '" data-index="' + index + '"' + dragAttr + '>';
      html += '<div class="portal-route-waypoint-num"><button type="button" class="portal-route-stop-num portal-route-waypoint-badge portal-route-waypoint-drag-handle' + badgeClass + (isLoop ? ' portal-route-loop-badge' : '') + '" title="' + badgeTitle + '" data-action="select-stop-center" data-index="' + index + '"' + dragHandleAttr + '>' + badge + '</button></div>';

      if (isLoop) {
        html += '<div class="portal-route-waypoint-name-cell"><button type="button" class="portal-route-waypoint-name" title="Loop back to first waypoint" data-action="select-stop-center" data-index="' + index + '">Loop back to ' + pr.escapeHtml(stop.title) + '</button></div>';
      } else if (stop.type === 'map' && !isManagedStart) {
        html += '<div class="portal-route-waypoint-name-cell"><input type="text" class="portal-route-waypoint-name portal-route-waypoint-name-input" title="Edit map point name" data-field="stop-title" data-index="' + index + '" value="' + pr.escapeHtml(stop.title) + '"></div>';
      } else {
        html += '<div class="portal-route-waypoint-name-cell"><button type="button" class="portal-route-waypoint-name" title="Select stop" data-action="select-stop" data-index="' + index + '">' + pr.escapeHtml(stop.title) + '</button></div>';
      }

      html += '<div class="portal-route-leg-cell">' + (index < stops.length - 1 ? pr.renderRouteSegment(legsByToIndex[index + 1]) : '') + '</div>';
      html += '<div class="portal-route-wait-cell"><input class="portal-route-wait-input" type="text" inputmode="decimal" value="' + pr.escapeHtml(waitValue) + '" title="Examples: 15m, 1.5h, 2d" data-field="stop-minutes" data-index="' + index + '" ' + (isLoop || isManagedStart ? 'disabled' : '') + '></div>';
      html += '<div class="portal-route-row-action"><button type="button" class="portal-route-row-button" title="Move up" data-action="move-stop-up" data-index="' + index + '" ' + (isLoop || isManagedStart || index === 0 || (pr.state.settings.startOnCurrentLocation && index === 1) ? 'disabled' : '') + '>&uarr;</button></div>';
      html += '<div class="portal-route-row-action"><button type="button" class="portal-route-row-button" title="Move down" data-action="move-stop-down" data-index="' + index + '" ' + (isLoop || isManagedStart || index >= realStops.length - 1 ? 'disabled' : '') + '>&darr;</button></div>';
      html += '<div class="portal-route-row-action"><button type="button" class="portal-route-row-button portal-route-remove-stop-button" title="Remove waypoint" data-action="remove-stop" data-index="' + index + '" ' + (isLoop || isManagedStart ? 'disabled' : '') + '>X</button></div>';
      html += '</div>';
    });

    html += '</div>';
    return html;
  };

  pr.renderTotals = function(route) {
    if (!route || !route.totals) return '';

    var html = '';
    html += '<div class="portal-route-totals">';
    html += '<div><span>Driving</span><strong>' + pr.formatDuration(route.totals.driveSeconds) + '</strong></div>';
    html += '<div><span>Stops</span><strong>' + pr.formatDuration(route.totals.stopSeconds) + '</strong></div>';
    html += '<div><span>Trip</span><strong>' + pr.formatDuration(route.totals.tripSeconds) + '</strong></div>';
    html += '<div><span>Distance</span><strong>' + pr.formatDistance(route.totals.distanceMeters) + '</strong></div>';
    html += '</div>';
    return html;
  };

  pr.renderPointsSummary = function(route) {
    if (!route || !route.totals) return '';

    var html = '';
    html += '<div class="portal-route-totals portal-route-points-summary">';
    html += '<div><span>Trip</span><strong>' + pr.formatDuration(route.totals.tripSeconds) + '</strong></div>';
    html += '<div><span>Driving</span><strong>' + pr.formatDuration(route.totals.driveSeconds) + '</strong></div>';
    html += '<div><span>Stops</span><strong>' + pr.formatDuration(route.totals.stopSeconds) + '</strong></div>';
    html += '<div><span>Distance</span><strong>' + pr.formatDistance(route.totals.distanceMeters) + ' / ' + pr.formatDistanceKm(route.totals.distanceMeters) + '</strong></div>';
    html += '</div>';
    return html;
  };

  pr.renderMainPanel = function(legsByToIndex) {
    var html = '';

    html += '<div class="portal-route-body">';
    html += '<div class="portal-route-list-options">';
    html += '<label class="portal-route-setting portal-route-default-stop-setting">Default stop time <input type="text" inputmode="decimal" value="' + pr.escapeHtml(pr.formatDurationInput(pr.state.settings.defaultStopMinutes)) + '" title="Examples: 15m, 1.5h, 2d" data-field="default-stop-minutes"> per portal</label>';
    html += '</div>';

    html += '<div class="portal-route-settings-row">';
    html += '<label class="portal-route-setting portal-route-checkbox-setting"><input type="checkbox" data-field="auto-replot-on-edit" ' + (pr.state.settings.autoReplotOnEdit ? 'checked ' : '') + '> Auto-replot</label>';
    html += '<label class="portal-route-setting portal-route-checkbox-setting"><input type="checkbox" data-field="show-segment-times-on-map" ' + (pr.state.settings.showSegmentTimesOnMap ? 'checked ' : '') + '> Show segment times on map</label>';
    html += '<label class="portal-route-setting portal-route-checkbox-setting"><input type="checkbox" data-field="show-mini-control" ' + (pr.state.settings.showMiniControl ? 'checked ' : '') + '> Mini control</label>';
    html += '<label class="portal-route-setting portal-route-checkbox-setting"><input type="checkbox" data-field="show-portal-details-controls" ' + (pr.state.settings.showPortalDetailsControls ? 'checked ' : '') + '> Info panel controls</label>';
    html += '</div>';

    html += '<div class="portal-route-control-group-buttons portal-route-footer-actions portal-route-points-actions">';
    html += '<button type="button" data-action="open-points-list">Open Route List</button>';
    html += '<button type="button" data-action="load-route">Route Library</button>';
    html += '</div>';

    if (pr.SHOW_VERSION_IN_PANEL) {
      html += '<div class="portal-route-version">Portal Route ' + pr.escapeHtml(pr.VERSION) + '</div>';
    }

    html += '<div class="portal-route-message" id="portal-route-message"></div>';
    html += '</div>';
    return html;
  };


  pr.getDialogWidth = function() {
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 520;

    if (viewportWidth <= 640) {
      return Math.max(320, viewportWidth);
    }

    return Math.min(480, Math.max(380, viewportWidth - 40));
  };

  pr.getPointsDialogWidth = function() {
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 640;

    if (viewportWidth <= 640) {
      return Math.max(320, viewportWidth);
    }

    return Math.min(760, Math.max(520, viewportWidth - 80));
  };

  pr.isDialogOpen = function(content) {
    if (!content || !window.jQuery) return false;

    try {
      var dialogContent = window.jQuery(content).closest('.ui-dialog-content');
      return dialogContent.length > 0 && dialogContent.dialog('isOpen');
    } catch (e) {
      return false;
    }
  };

  pr.shouldRestorePanelPosition = function() {
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 520;
    return viewportWidth > 640;
  };

  pr.clampPanelPosition = function(position, wrapper) {
    if (!position || !wrapper || !wrapper.length) return null;
    if (position.left === 0 && position.top === 0) return null;

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 520;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 640;
    var width = wrapper.outerWidth() || pr.getDialogWidth();
    var height = wrapper.outerHeight() || 220;
    var maxLeft = Math.max(0, viewportWidth - Math.min(width, viewportWidth));
    var maxTop = Math.max(0, viewportHeight - Math.min(height, viewportHeight));

    return {
      left: Math.min(Math.max(0, position.left), maxLeft),
      top: Math.min(Math.max(0, position.top), maxTop)
    };
  };

  pr.clampPanelSize = function(size) {
    if (!size || !pr.shouldRestorePanelPosition()) return null;

    var viewportWidth = window.innerWidth || document.documentElement.clientWidth || 520;
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 640;
    var maxWidth = Math.max(320, viewportWidth - 20);
    var maxHeight = Math.max(220, viewportHeight - 20);

    return {
      width: Math.min(Math.max(320, size.width), maxWidth),
      height: Math.min(Math.max(220, size.height), maxHeight)
    };
  };

  pr.saveCurrentPanelPosition = function(wrapper) {
    if (!wrapper || !wrapper.length || !pr.shouldRestorePanelPosition()) return;

    var offset = wrapper.offset();
    if (!offset) return;
    if (Math.round(offset.left) === 0 && Math.round(offset.top) === 0) return;

    pr.state.panelPosition = {
      left: Math.round(offset.left),
      top: Math.round(offset.top)
    };
    pr.savePanelPosition();
  };

  pr.saveCurrentPanelSize = function(wrapper) {
    if (!wrapper || !wrapper.length || !pr.shouldRestorePanelPosition()) return;

    var size = pr.clampPanelSize({
      width: Math.round(wrapper.outerWidth() || 0),
      height: Math.round(wrapper.outerHeight() || 0)
    });
    if (!size) return;

    pr.state.panelSize = size;
    pr.savePanelSize();
  };

  pr.restorePanelSize = function(wrapper) {
    if (!wrapper || !wrapper.length || !pr.shouldRestorePanelPosition()) return;

    var size = pr.clampPanelSize(pr.state.panelSize);
    if (!size) return;

    wrapper.css({ width: size.width + 'px', height: size.height + 'px' });
  };

  pr.restorePanelPosition = function(wrapper) {
    if (!wrapper || !wrapper.length || !pr.shouldRestorePanelPosition()) return;

    var position = pr.clampPanelPosition(pr.state.panelPosition, wrapper);
    if (!position) return;

    wrapper.css({
      left: position.left + 'px',
      top: position.top + 'px',
      right: 'auto',
      bottom: 'auto'
    });
  };

  pr.attachPanelPositionHandlers = function(content) {
    if (!content || !window.jQuery) return;

    try {
      var dialogContent = window.jQuery(content).closest('.ui-dialog-content');
      var wrapper = dialogContent.closest('.ui-dialog');
      pr.restorePanelSize(wrapper);
      pr.restorePanelPosition(wrapper);
      dialogContent
        .off('dialogdragstop.portalRoute dialogresizestop.portalRoute')
        .on('dialogdragstop.portalRoute', function() {
          pr.saveCurrentPanelPosition(wrapper);
        })
        .on('dialogresizestop.portalRoute', function() {
          pr.saveCurrentPanelPosition(wrapper);
          pr.saveCurrentPanelSize(wrapper);
        });
    } catch (e) {
      console.warn('Portal Route: failed to attach dialog position handler', e);
    }
  };

  pr.focusPanelContainer = function(content) {
    if (!content || !content.focus || !window.setTimeout) return;

    window.setTimeout(function() {
      if (!content || !content.focus) return;
      try {
        content.focus({ preventScroll: true });
      } catch (e) {
        content.focus();
      }
    }, 0);
  };

  pr.renderPanel = function() {
    if (pr.isLayerEnabled && !pr.isLayerEnabled()) {
      pr.closeDialog();
      pr.closePointsDialog();
      return;
    }

    pr.renderMiniControl();

    if (!pr.state.panelOpen) {
      pr.closeDialog();
      if (pr.state.pointsPanelOpen) pr.renderPointsPanel();
      return;
    }

    var route = pr.state.route;
    var legsByToIndex = {};
    if (route && route.legs) {
      route.legs.forEach(function(leg) { legsByToIndex[leg.toIndex] = leg; });
    }

    var contentHtml = pr.renderMainPanel(legsByToIndex);
    var existingContent = document.getElementById(pr.DOM_IDS.dialogContent);

    if (pr.isDialogOpen(existingContent)) {
      existingContent.innerHTML = contentHtml;
      if (pr.state.pointsPanelOpen) pr.renderPointsPanel();
      return;
    }

    var html = '<div id="' + pr.DOM_IDS.dialogContent + '" class="portal-route-dialog-content" tabindex="-1">' + contentHtml + '</div>';

    if (typeof window.dialog === 'function') {
      window.dialog({
        id: pr.DOM_IDS.dialog,
        title: 'Portal Route Settings',
        html: html,
        dialogClass: 'portal-route-dialog',
        width: pr.getDialogWidth()
      });

      var newContent = document.getElementById(pr.DOM_IDS.dialogContent);
      if (newContent && window.jQuery) {
        try {
          pr.attachPanelPositionHandlers(newContent);
          pr.focusPanelContainer(newContent);
          window.jQuery(newContent)
            .closest('.ui-dialog-content')
            .off('dialogclose.portalRoute')
            .on('dialogclose.portalRoute', function() {
              pr.saveCurrentPanelSize(window.jQuery(this).closest('.ui-dialog'));
              pr.state.panelOpen = false;
              pr.savePanelOpen();
            });
        } catch (e) {
          console.warn('Portal Route: failed to attach dialog close handler', e);
        }
      }
    } else {
      console.log('Portal Route: IITC dialog API is unavailable.');
    }

    if (pr.state.pointsPanelOpen) pr.renderPointsPanel();
  };

  pr.renderPointsPanel = function() {
    if (pr.isLayerEnabled && !pr.isLayerEnabled()) {
      pr.closePointsDialog();
      return;
    }

    if (!pr.state.pointsPanelOpen) {
      pr.closePointsDialog();
      return;
    }

    var route = pr.state.route;
    var legsByToIndex = {};
    if (route && route.legs) {
      route.legs.forEach(function(leg) { legsByToIndex[leg.toIndex] = leg; });
    }

    var contentHtml = '';
    contentHtml += pr.renderPointsSummary(route);
    if (pr.state.routeDirty) {
      contentHtml += '<div class="portal-route-stale">Route needs replot.</div>';
    }
    contentHtml += '<div class="portal-route-bottom-summary"><b>Waypoints:</b> ' + pr.state.stops.length + (pr.makeLoopStop() && pr.state.stops.length > 1 ? ' + loop' : '') + '</div>';
    contentHtml += '<div class="portal-route-points-list-body">';
    contentHtml += '<div class="portal-route-body">' + pr.renderStopsList(legsByToIndex) + '</div>';
    contentHtml += '</div>';
    contentHtml += '<div class="portal-route-control-group-buttons portal-route-footer-actions portal-route-points-panel-actions">';
    contentHtml += '<button type="button" data-action="add-selected-stop">Add Portal</button>';
    contentHtml += '<button type="button" data-action="add-map-point"' + (pr.state.addPointMode ? ' class="portal-route-active-action"' : '') + '>Add Point</button>';
    contentHtml += '<button type="button" data-action="add-current-location">Add Me</button>';
    contentHtml += '<span class="portal-route-button-divider" aria-hidden="true"></span>';
    contentHtml += '<button type="button" data-action="toggle-loop-back"' + (pr.state.settings.includeReturnToStart ? ' class="portal-route-active-action"' : '') + '>Loop</button>';
    contentHtml += '<button type="button" data-action="calculate-route">' + (pr.state.routeDirty ? 'Replot' : 'Plot') + '</button>';
    contentHtml += '<button type="button" data-action="fit-route">Fit</button>';
    contentHtml += '<button type="button" data-action="open-google-maps">Maps</button>';
    contentHtml += '<button type="button" data-action="clear-route">Clear</button>';
    contentHtml += '<span class="portal-route-button-divider" aria-hidden="true"></span>';
    contentHtml += '<button type="button" data-action="print-route">Print</button>';
    contentHtml += '<button type="button" data-action="save-route">Save</button>';
    contentHtml += '<button type="button" data-action="load-route">Load</button>';
    contentHtml += '<button type="button" data-action="open-main">Settings</button>';
    contentHtml += '</div>';
    var existingContent = document.getElementById(pr.DOM_IDS.pointsDialogContent);

    if (pr.isDialogOpen(existingContent)) {
      existingContent.innerHTML = contentHtml;
      return;
    }

    var html = '<div id="' + pr.DOM_IDS.pointsDialogContent + '" class="portal-route-dialog-content portal-route-points-dialog-content" tabindex="-1">' + contentHtml + '</div>';

    if (typeof window.dialog === 'function') {
      window.dialog({
        id: pr.DOM_IDS.pointsDialog,
        title: 'Portal Route Points',
        html: html,
        dialogClass: 'portal-route-dialog portal-route-points-dialog',
        width: pr.getPointsDialogWidth()
      });

      var newContent = document.getElementById(pr.DOM_IDS.pointsDialogContent);
      if (newContent && window.jQuery) {
        try {
          pr.focusPanelContainer(newContent);
          window.jQuery(newContent)
            .closest('.ui-dialog-content')
            .off('dialogclose.portalRoutePoints')
            .on('dialogclose.portalRoutePoints', function() {
              pr.state.pointsPanelOpen = false;
            });
        } catch (e) {
          console.warn('Portal Route: failed to attach points dialog close handler', e);
        }
      }
    } else {
      console.log('Portal Route: IITC dialog API is unavailable.');
    }
  };
