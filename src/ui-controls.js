  pr.escapeHtml = pr.escapeHtml || function(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  pr.routeAttrHtml = function(attrs) {
    if (!attrs) return '';

    var html = '';
    Object.keys(attrs).forEach(function(name) {
      var value = attrs[name];
      if (value === false || value === null || value === undefined) return;
      if (value === true) {
        html += ' ' + name;
      } else {
        html += ' ' + name + '="' + pr.escapeHtml(value) + '"';
      }
    });
    return html;
  };

  pr.ROUTE_CONTROL_CLASSES = pr.ROUTE_CONTROL_CLASSES || {
    smartButton: 'portal-route-smart-button',
    addDeleteButton: 'portal-route-add-delete-button',
    removeAction: 'portal-route-remove-action',
    addPointActive: 'portal-route-add-point-active',
    replotButton: 'portal-route-replot-button',
    replotNeeded: 'portal-route-replot-needed',
    contextStale: 'portal-route-context-stale'
  };

  pr.routeButtonClassName = function(options) {
    options = options || {};

    var classes = [];
    if (options.smart) classes.push(pr.ROUTE_CONTROL_CLASSES.smartButton);
    if (options.addDelete) classes.push(pr.ROUTE_CONTROL_CLASSES.addDeleteButton);
    if (options.remove) classes.push(pr.ROUTE_CONTROL_CLASSES.removeAction);
    if (options.active) classes.push(pr.ROUTE_CONTROL_CLASSES.addPointActive);
    if (options.extraClass) classes.push(options.extraClass);

    return classes.join(' ');
  };

  pr.routeButtonHtml = function(options) {
    options = options || {};

    var attrs = options.attrs || {};
    attrs.type = attrs.type || 'button';
    if (options.action) attrs['data-action'] = options.action;
    if (options.index !== undefined && options.index !== null) attrs['data-index'] = options.index;
    if (options.ariaLabel) attrs['aria-label'] = options.ariaLabel;
    if (options.disabled) attrs.disabled = true;

    var className = pr.routeButtonClassName(options);
    if (className) attrs.class = className;

    return '<button' + pr.routeAttrHtml(attrs) + '>' + pr.escapeHtml(options.label || '') + '</button>';
  };

  pr.createRouteButtonElement = function(options) {
    options = options || {};

    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = options.label || '';
    if (options.action) button.setAttribute('data-action', options.action);
    if (options.index !== undefined && options.index !== null) button.setAttribute('data-index', options.index);
    if (options.ariaLabel) button.setAttribute('aria-label', options.ariaLabel);
    if (options.disabled) button.disabled = true;

    var className = pr.routeButtonClassName(options);
    if (className) button.className = className;

    if (options.attrs) {
      Object.keys(options.attrs).forEach(function(name) {
        var value = options.attrs[name];
        if (value === false || value === null || value === undefined) return;
        button.setAttribute(name, value === true ? '' : value);
      });
    }

    return button;
  };

  pr.createRouteActionLink = function(options) {
    options = options || {};

    var link = document.createElement('a');
    link.href = '#';
    link.textContent = options.label || '';
    if (options.action) link.setAttribute('data-action', options.action);
    if (options.ariaLabel) link.setAttribute('aria-label', options.ariaLabel);

    var className = pr.routeButtonClassName(options);
    if (className) link.className = className;

    if (options.attrs) {
      Object.keys(options.attrs).forEach(function(name) {
        var value = options.attrs[name];
        if (value === false || value === null || value === undefined) return;
        link.setAttribute(name, value === true ? '' : value);
      });
    }

    return link;
  };

  pr.appendRouteButton = function(parent, options) {
    var button = pr.createRouteButtonElement(options);
    parent.appendChild(button);
    return button;
  };

  pr.appendRouteLink = function(parent, options) {
    var link = pr.createRouteActionLink(options);
    parent.appendChild(link);
    return link;
  };

  pr.selectedAddDeleteButtonOptions = function(labelMode) {
    var selectedInRoute = pr.selectedStopIndex && pr.selectedStopIndex() >= 0;
    var label = selectedInRoute ? 'Del' : 'Add';

    return {
      label: labelMode === 'symbol' ? (selectedInRoute ? '-' : '+') : label,
      action: selectedInRoute ? 'toggle-selected-stop' : 'smart-add',
      ariaLabel: selectedInRoute ? 'Remove selected waypoint from route' : 'Add selected portal or create a waypoint',
      smart: true,
      addDelete: selectedInRoute,
      remove: selectedInRoute,
      active: !selectedInRoute && !!(pr.state && pr.state.addPointMode)
    };
  };

  pr.selectedAddDeleteButton = function(labelMode) {
    return pr.routeButtonHtml(pr.selectedAddDeleteButtonOptions(labelMode));
  };

  pr.undoRouteEditButtonOptions = function() {
    return {
      label: 'Undo',
      action: 'undo-route-edit',
      ariaLabel: 'Undo last route edit',
      smart: true,
      disabled: !(pr.canUndoRouteEdit && pr.canUndoRouteEdit())
    };
  };

  pr.undoRouteEditButton = function() {
    return pr.routeButtonHtml(pr.undoRouteEditButtonOptions());
  };

  pr.mainMenuButtonOptions = function(label, extraClass) {
    return {
      label: label || 'Menu',
      action: 'open-main-menu',
      smart: true,
      extraClass: extraClass,
      attrs: { 'data-main-menu': 'true' }
    };
  };

  pr.mainMenuButton = function(label, extraClass) {
    return pr.routeButtonHtml(pr.mainMenuButtonOptions(label, extraClass));
  };

  pr.mainMenuLinkOptions = function(label, extraClass) {
    return pr.mainMenuButtonOptions(label || 'Menu', extraClass);
  };

  pr.routeReplotLabel = function() {
    return pr.state.routeDirty || pr.state.route ? 'Replot' : 'Route';
  };

  pr.canCalculateRoute = function() {
    return !!(pr.getRouteStops && pr.getRouteStops().length >= 2);
  };

  pr.routeReplotButtonOptions = function(options) {
    options = options || {};
    var classes = pr.ROUTE_CONTROL_CLASSES.replotButton;
    if (pr.state.routeDirty) classes += ' ' + pr.ROUTE_CONTROL_CLASSES.replotNeeded;

    return {
      label: pr.routeReplotLabel(),
      action: 'calculate-route',
      disabled: !!options.disableWhenUnavailable && !pr.canCalculateRoute(),
      extraClass: classes
    };
  };

  pr.routeReplotMenuItem = function() {
    return {
      label: pr.routeReplotLabel(),
      action: 'calculate-route',
      disabled: !pr.canCalculateRoute(),
      className: pr.state.routeDirty ? pr.ROUTE_CONTROL_CLASSES.contextStale : ''
    };
  };

  pr.reverseRouteButtonOptions = function() {
    return {
      label: 'Reverse route',
      action: 'reverse-route',
      disabled: pr.state.stops.length <= 1
    };
  };

  pr.fitRouteButtonOptions = function() {
    return {
      label: 'Fit',
      action: 'fit-route'
    };
  };

  pr.createMiniControlButton = function(options) {
    options = options || {};

    var className = options.className ? ' class="' + pr.escapeHtml(options.className) + '"' : '';
    var attrs = {
      href: '#',
      'aria-label': options.ariaLabel || options.label || '',
      'data-action': options.action || ''
    };
    if (options.mainMenu) attrs['data-main-menu'] = 'true';
    if (options.mapsMenu) attrs['data-maps-menu'] = 'true';

    return '<a' + className + pr.routeAttrHtml(attrs) + '>' + pr.escapeHtml(options.label || '') + '</a>';
  };

  pr.miniControlButtonOptions = function() {
    var selectedInRoute = pr.selectedStopIndex && pr.selectedStopIndex() >= 0;
    var addPointActive = !!(pr.state && pr.state.addPointMode);
    var addRemoveClass = selectedInRoute ? 'portal-route-mini-add portal-route-mini-remove' : 'portal-route-mini-add';
    if (addPointActive && !selectedInRoute) addRemoveClass += ' portal-route-mini-add-active';
    var loopClass = pr.state.settings.includeReturnToStart ? 'portal-route-mini-loop portal-route-mini-active' : 'portal-route-mini-loop';

    return [
      { label: 'M', action: 'open-maps-menu', ariaLabel: 'Open map export choices', className: 'portal-route-mini-maps', mapsMenu: true },
      { label: 'L', action: 'toggle-loop-back', ariaLabel: pr.state.settings.includeReturnToStart ? 'Turn off loop back to start' : 'Loop back to start', className: loopClass },
      { label: selectedInRoute ? '-' : '+', action: selectedInRoute ? 'toggle-selected-stop' : 'smart-add', ariaLabel: selectedInRoute ? 'Remove selected waypoint from route' : 'Add selected portal or place a map point', className: addRemoveClass },
      { label: String(pr.state.stops.length), action: 'open-points-list', ariaLabel: 'Open points list' },
      { label: '=', action: 'open-main-menu', ariaLabel: 'Open Portal Route menu', mainMenu: true }
    ];
  };

  pr.renderMiniControlButtons = function() {
    return pr.miniControlButtonOptions().map(function(options) {
      return pr.createMiniControlButton(options);
    }).join('');
  };

  pr.routeContextMenuButtonHtml = function(item) {
    if (!item) return '';
    if (item.divider) return '<div class="portal-route-context-divider"></div>';

    return pr.routeButtonHtml({
      label: item.label,
      action: item.action,
      index: item.index,
      disabled: item.disabled,
      extraClass: item.className,
      attrs: item.attrs
    });
  };

  pr.routeContextMenuHtml = function(items) {
    var html = '';
    (items || []).forEach(function(item) {
      html += pr.routeContextMenuButtonHtml(item);
    });
    return html;
  };

  pr.mapExportMenuItems = function() {
    var hasRoute = pr.canCalculateRoute();

    return [
      { label: 'Google Maps', action: 'open-google-maps', disabled: !hasRoute },
      { label: 'Apple Maps', action: 'open-apple-maps', disabled: !hasRoute }
    ];
  };

  pr.mainMenuItems = function() {
    var hasStops = pr.state.stops.length > 0;

    return [
      { label: 'Add me', action: 'add-current-location' },
      { label: pr.state.settings.includeReturnToStart ? 'Unloop' : 'Loop', action: 'toggle-loop-back' },
      { label: 'Clear Route', action: 'clear-route', disabled: !hasStops },
      { label: 'Save', action: 'save-route', disabled: !hasStops },
      { label: 'Undo', action: 'undo-route-edit', disabled: !(pr.canUndoRouteEdit && pr.canUndoRouteEdit()) },
      { divider: true }
    ].concat(pr.mapExportMenuItems(), [
      { divider: true },
      pr.routeReplotMenuItem(),
      { label: 'Route List', action: 'open-points-list', disabled: !hasStops },
      { label: 'Library', action: 'load-route' },
      { label: 'Settings', action: 'open-main' }
    ]);
  };

  pr.mapsMenuItems = function() {
    return pr.mapExportMenuItems();
  };

  pr.stopMenuItems = function(index) {
    var stop = pr.getRouteStop(index);
    if (!stop || stop.generatedLoop) return null;
    var isManagedStart = pr.isManagedStartStop(stop);

    return [
      { label: 'Delete', action: 'remove-stop', index: index, disabled: isManagedStart },
      { label: 'Rename', action: 'rename-stop', index: index, disabled: isManagedStart },
      { divider: true },
      { label: 'Set as start', action: 'set-stop-start', index: index, disabled: isManagedStart },
      { label: 'Set as end', action: 'set-stop-end', index: index, disabled: isManagedStart }
    ];
  };

  pr.openRouteContextMenu = function(items, className, x, y) {
    pr.closeAddMenu();

    if (!items) return;
    var menu = document.createElement('div');
    menu.className = 'portal-route-context-menu' + (className ? ' ' + className : '');
    menu.innerHTML = pr.routeContextMenuHtml(items);

    document.body.appendChild(menu);
    pr.positionContextMenu(menu, x, y);
  };
