// ==UserScript==
// @id             iitc-plugin-driving-route
// @name           IITC plugin: Driving Route
// @category       Layer
// @version        0.1.0-dev
// @namespace      https://github.com/mdiehn/iitc-plugin-driving-route
// @description    Mobile-first route planning through selected portals with segment drive times, stop-time accounting, and Google Maps export.
// @include        https://intel.ingress.com/*
// @include        http://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @match          http://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function() {};
  window.plugin.drivingRoute = window.plugin.drivingRoute || {};

  var dr = window.plugin.drivingRoute;

  dr.CSS = `
  .driving-route-panel {
    position: fixed;
    right: 10px;
    bottom: 10px;
    width: min(380px, calc(100vw - 20px));
    max-height: min(520px, calc(100vh - 20px));
    overflow: auto;
    background: #1f1f1f;
    color: #eee;
    border: 1px solid #666;
    border-radius: 8px;
    z-index: 99999;
    box-shadow: 0 2px 12px rgba(0,0,0,0.5);
    font-size: 13px;
  }

  .driving-route-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    border-bottom: 1px solid #555;
  }

  .driving-route-header strong {
    flex: 1;
  }

  .driving-route-toggle,
  .driving-route-actions button,
  .driving-route-small-button {
    min-height: 36px;
    padding: 6px 10px;
  }

  .driving-route-body {
    padding: 8px;
  }

  .driving-route-panel-collapsed .driving-route-body {
    display: none;
  }

  .driving-route-setting {
    display: block;
    margin-bottom: 8px;
  }

  .driving-route-setting input {
    width: 4em;
  }

  .driving-route-stops {
    padding-left: 0;
    margin: 8px 0;
    list-style: none;
  }

  .driving-route-stop {
    border: 1px solid #555;
    border-radius: 6px;
    padding: 8px;
    margin-bottom: 8px;
    background: #2a2a2a;
  }

  .driving-route-stop-title {
    display: flex;
    gap: 6px;
    font-weight: bold;
  }

  .driving-route-stop-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 22px;
    height: 22px;
    border-radius: 999px;
    background: #ff7f00;
    color: #111;
  }

  .driving-route-leg,
  .driving-route-stop-meta {
    margin-top: 4px;
  }

  .driving-route-actions {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .driving-route-message {
    display: none;
    margin-top: 8px;
    padding: 6px;
    border: 1px solid #777;
    border-radius: 4px;
  }

  .driving-route-message-visible {
    display: block;
  }

  .driving-route-stop-label span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 999px;
    background: #ff7f00;
    color: #111;
    font-weight: bold;
    border: 2px solid #111;
  }

  .driving-route-stop-actions {
    display: flex;
    justify-content: flex-end;
    gap: 6px;
    margin-top: 6px;
  }



  /* mobile media */
  @media (max-width: 700px) {
    .driving-route-panel {
      left: 8px;
      right: 8px;
      bottom: 8px;
      width: auto;
      max-height: 55vh;
      resize: none;
    }

    .driving-route-header {
      cursor: default;
    }
  }

  /* desktop media  */
  @media (min-width: 701px) {
    .driving-route-panel {
      right: 12px;
      bottom: 12px;
      width: 300px;
      height: auto;
      max-height: calc(100vh - 24px);

      resize: both;
      overflow: auto;
      min-width: 240px;
      min-height: 44px;
      max-width: calc(100vw - 24px);
    }

    .driving-route-panel.driving-route-panel-collapsed {
      height: auto !important;
      min-height: 0;
      resize: none;
      overflow: hidden;
    }

    .driving-route-panel.driving-route-panel-collapsed .driving-route-body {
      display: none;
    }

    .driving-route-panel.driving-route-panel-collapsed .driving-route-header {
      border-bottom: 0;
    }

    .driving-route-header {
      cursor: move;
    }

    .driving-route-stop-actions button[data-action="move-stop-up"],
    .driving-route-stop-actions button[data-action="move-stop-down"] {
      display: none;
    }

  }

  .driving-route-stop[draggable="true"] {
    cursor: grab;
  }

  .driving-route-stop.driving-route-dragging {
    opacity: 0.6;
  }

  `;

  dr.ID = 'driving-route';
  dr.NAME = 'Driving Route';
  dr.VERSION = '0.1.0-dev';

  dr.STORAGE_KEYS = {
    stops: 'iitc-driving-route-stops',
    settings: 'iitc-driving-route-settings',
    panelOpen: 'iitc-driving-route-panel-open',
    panelPosition: 'iitc-driving-route-panel-position'
  };

  dr.DEFAULT_SETTINGS = {
    defaultStopMinutes: 5,
    includeReturnToStart: false
  };

  dr.state = {
    stops: [],
    route: null,
    settings: Object.assign({}, dr.DEFAULT_SETTINGS),
    layers: {
      labels: null,
      routeLine: null
    },
    panelOpen: true
  };

  dr.getEffectiveStopMinutes = function(stop) {
    if (stop && typeof stop.stopMinutes === 'number' && !Number.isNaN(stop.stopMinutes)) {
      return stop.stopMinutes;
    }
    return dr.state.settings.defaultStopMinutes;
  };

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

  dr.formatDuration = function(seconds) {
    seconds = Math.max(0, Math.round(seconds || 0));
    var minutes = Math.round(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;

    if (hours > 0 && mins > 0) return hours + ' hr ' + mins + ' min';
    if (hours > 0) return hours + ' hr';
    return minutes + ' min';
  };

  dr.formatDistance = function(meters) {
    meters = Math.max(0, Number(meters || 0));
    var miles = meters / 1609.344;
    if (miles >= 10) return miles.toFixed(0) + ' mi';
    return miles.toFixed(1) + ' mi';
  };

  dr.portalToStop = function(guid) {
    var portal = guid && window.portals && window.portals[guid];
    if (!portal || !portal.getLatLng) return null;

    var latlng = portal.getLatLng();
    var data = portal.options && portal.options.data ? portal.options.data : {};

    return {
      guid: guid,
      title: data.title || data.name || guid,
      lat: latlng.lat,
      lng: latlng.lng
    };
  };

  dr.addSelectedPortal = function() {
    var guid = window.selectedPortal;
    var stop = dr.portalToStop(guid);
    if (!stop) {
      dr.showMessage('No selected portal found.');
      return;
    }
    dr.addStop(stop);
  };

  dr.injectPortalDetailsAction = function() {
    var container = document.querySelector('#portaldetails .linkdetails') || document.querySelector('#portaldetails');
    if (!container || container.querySelector('.driving-route-add-link')) return;

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'driving-route-add-link';
    link.textContent = 'Add to Driving Route';
    link.addEventListener('click', function(ev) {
      ev.preventDefault();
      dr.addSelectedPortal();
    });

    var wrapper = document.createElement('div');
    wrapper.className = 'driving-route-portal-action';
    wrapper.appendChild(link);
    container.appendChild(wrapper);
  };

  dr.addStop = function(stop) {
    if (!stop || typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return;

    if (stop.guid && dr.state.stops.some(function(existing) { return existing.guid === stop.guid; })) {
      dr.showMessage('Already in route: ' + stop.title);
      return;
    }

    dr.state.stops.push({
      guid: stop.guid || null,
      title: stop.title || 'Unnamed portal',
      lat: stop.lat,
      lng: stop.lng,
      stopMinutes: null
    });

    dr.state.route = null;
    dr.saveStops();
    dr.redrawLabels();
    dr.renderPanel();
  };

  dr.removeStop = function(index) {
    if (index < 0 || index >= dr.state.stops.length) return;
    dr.state.stops.splice(index, 1);
    dr.state.route = null;
    dr.saveStops();
    dr.clearRouteLine();
    dr.redrawLabels();
    dr.renderPanel();
  };

  dr.clearStops = function() {
    dr.state.stops = [];
    dr.state.route = null;
    dr.saveStops();
    dr.clearRouteLine();
    dr.redrawLabels();
    dr.renderPanel();
  };

  dr.moveStop = function(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= dr.state.stops.length) return;
    if (toIndex < 0 || toIndex >= dr.state.stops.length) return;
    if (fromIndex === toIndex) return;

    var item = dr.state.stops.splice(fromIndex, 1)[0];
    dr.state.stops.splice(toIndex, 0, item);

    dr.state.route = null;
    dr.saveStops();
    dr.clearRouteLine();
    dr.redrawLabels();
    dr.renderPanel();
  };

  dr.calculateTotals = function(legs) {
    var driveSeconds = 0;
    var distanceMeters = 0;

    legs.forEach(function(leg) {
      driveSeconds += leg.durationSeconds || 0;
      distanceMeters += leg.distanceMeters || 0;
    });

    var stopSeconds = dr.state.stops.reduce(function(sum, stop) {
      return sum + dr.getEffectiveStopMinutes(stop) * 60;
    }, 0);

    return {
      driveSeconds: driveSeconds,
      stopSeconds: stopSeconds,
      tripSeconds: driveSeconds + stopSeconds,
      distanceMeters: distanceMeters
    };
  };

  dr.getGoogleLatLng = function(stop) {
    return new google.maps.LatLng(stop.lat, stop.lng);
  };

  dr.calculateRoute = function() {
    if (dr.state.stops.length < 2) {
      dr.showMessage('Add at least two portals to calculate a route.');
      return;
    }

    if (!window.google || !google.maps || !google.maps.DirectionsService) {
      dr.showMessage('Google Maps DirectionsService is not available in this IITC session.');
      return;
    }

    var stops = dr.state.stops;
    var origin = stops[0];
    var destination = stops[stops.length - 1];
    var waypoints = stops.slice(1, -1).map(function(stop) {
      return { location: dr.getGoogleLatLng(stop), stopover: true };
    });

    var service = new google.maps.DirectionsService();
    var request = {
      origin: dr.getGoogleLatLng(origin),
      destination: dr.getGoogleLatLng(destination),
      waypoints: waypoints,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING
    };

    dr.setBusy(true);
    service.route(request, function(result, status) {
      dr.setBusy(false);

      if (status !== google.maps.DirectionsStatus.OK) {
        dr.showMessage('Route calculation failed: ' + status);
        return;
      }

      var route = result.routes && result.routes[0];
      if (!route) {
        dr.showMessage('Route calculation returned no route.');
        return;
      }

      var legs = route.legs.map(function(leg, index) {
        var fromStop = stops[index];
        var toStop = stops[index + 1];
        return {
          fromIndex: index,
          toIndex: index + 1,
          fromLabel: fromStop ? fromStop.title : 'Stop ' + (index + 1),
          toLabel: toStop ? toStop.title : 'Stop ' + (index + 2),
          distanceMeters: leg.distance ? leg.distance.value : 0,
          durationSeconds: leg.duration ? leg.duration.value : 0,
          distanceText: leg.distance ? leg.distance.text : '',
          durationText: leg.duration ? leg.duration.text : ''
        };
      });

      var path = [];
      if (route.overview_path) {
        path = route.overview_path.map(function(point) {
          return L.latLng(point.lat(), point.lng());
        });
      }

      dr.state.route = {
        legs: legs,
        totals: dr.calculateTotals(legs)
      };

      dr.drawRoutePath(path);
      dr.renderPanel();
    });
  };

  dr.ensureLayers = function() {
    if (!dr.state.layers.labels) {
      dr.state.layers.labels = L.layerGroup().addTo(window.map);
    }
  };

  dr.clearRouteLine = function() {
    if (dr.state.layers.routeLine) {
      window.map.removeLayer(dr.state.layers.routeLine);
      dr.state.layers.routeLine = null;
    }
  };

  dr.redrawLabels = function() {
    if (!window.map || !window.L) return;
    dr.ensureLayers();
    dr.state.layers.labels.clearLayers();

    dr.state.stops.forEach(function(stop, index) {
      var icon = L.divIcon({
        className: 'driving-route-stop-label',
        html: '<span>' + (index + 1) + '</span>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      var marker = L.marker([stop.lat, stop.lng], { icon: icon, interactive: true });
      marker.bindTooltip((index + 1) + '. ' + stop.title, { direction: 'top' });
      marker.addTo(dr.state.layers.labels);
    });
  };

  dr.drawRoutePath = function(path) {
    dr.clearRouteLine();
    if (!path || path.length < 2) return;

    dr.state.layers.routeLine = L.polyline(path, {
      color: '#ff7f00',
      weight: 5,
      opacity: 0.8
    }).addTo(window.map);

    try {
      window.map.fitBounds(dr.state.layers.routeLine.getBounds(), { padding: [30, 30] });
    } catch (e) {
      console.warn('Driving Route: unable to fit route bounds', e);
    }
  };

  dr.escapeHtml = function(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  dr.renderPanel = function() {
    var panel = document.getElementById('driving-route-panel');
    if (!panel) return;

    panel.classList.toggle('driving-route-panel-collapsed', !dr.state.panelOpen);

    var stops = dr.state.stops;
    var route = dr.state.route;
    var legsByToIndex = {};
    if (route && route.legs) {
      route.legs.forEach(function(leg) { legsByToIndex[leg.toIndex] = leg; });
    }

    var html = '';
    html += '<div class="driving-route-header">';
    html += '<button class="driving-route-toggle" type="button" data-action="toggle-panel">' + (dr.state.panelOpen ? '−' : '+') + '</button>';
    html += '<strong>Driving Route</strong>';
    html += '<span class="driving-route-count">' + stops.length + ' stops</span>';
    html += '</div>';

    html += '<div class="driving-route-body">';
    html += '<label class="driving-route-setting">Stop time <input type="number" min="0" max="120" step="1" value="' + dr.escapeHtml(dr.state.settings.defaultStopMinutes) + '" data-field="default-stop-minutes"> min/portal</label>';

    if (stops.length === 0) {
      html += '<p class="driving-route-empty">Tap a portal, then use <b>Add to Driving Route</b>.</p>';
    } else {
      html += '<ol class="driving-route-stops">';
      stops.forEach(function(stop, index) {
        var leg = legsByToIndex[index];
        html += '<li class="driving-route-stop" draggable="' + (dr.isDesktopLayout() ? 'true' : 'false') + '" data-index="' + index + '" >';
        html += '<div class="driving-route-stop-title"><span class="driving-route-stop-num">' + (index + 1) + '</span><span>' + dr.escapeHtml(stop.title) + '</span></div>';
        if (leg) {
          html += '<div class="driving-route-leg">Drive from previous: ' + dr.escapeHtml(leg.durationText || dr.formatDuration(leg.durationSeconds)) + ' · ' + dr.escapeHtml(leg.distanceText || dr.formatDistance(leg.distanceMeters)) + '</div>';
        }
        html += '<div class="driving-route-stop-meta">Stop: ' + dr.getEffectiveStopMinutes(stop) + ' min</div>';

        html += '<div class="driving-route-stop-actions">';
        html += '<button type="button" class="driving-route-small-button" data-action="remove-stop" data-index="' + index + '">Remove</button>';
        html += '<button type="button" class="driving-route-small-button" data-action="move-stop-up" data-index="' + index + '" ' + (index === 0 ? 'disabled' : '') + '>↑</button>';
        html += '<button type="button" class="driving-route-small-button" data-action="move-stop-down" data-index="' + index + '" ' + (index === stops.length - 1 ? 'disabled' : '') + '>↓</button>';
        html += '</div>';

        html += '</li>';
      });
      html += '</ol>';
    }

    if (route && route.totals) {
      html += '<div class="driving-route-totals">';
      html += '<div><span>Driving</span><strong>' + dr.formatDuration(route.totals.driveSeconds) + '</strong></div>';
      html += '<div><span>Stops</span><strong>' + dr.formatDuration(route.totals.stopSeconds) + '</strong></div>';
      html += '<div><span>Trip</span><strong>' + dr.formatDuration(route.totals.tripSeconds) + '</strong></div>';
      html += '<div><span>Distance</span><strong>' + dr.formatDistance(route.totals.distanceMeters) + '</strong></div>';
      html += '</div>';
    }

    html += '<div class="driving-route-actions">';
    html += '<button type="button" data-action="calculate-route">Calculate</button>';
    html += '<button type="button" data-action="open-google-maps">Open Maps</button>';
    html += '<button type="button" data-action="clear-route">Clear</button>';
    html += '</div>';
    html += '<div class="driving-route-message" id="driving-route-message"></div>';
    html += '</div>';

    panel.innerHTML = html;
    dr.enablePanelDragging(panel);
  };

  dr.googleMapsUrl = function() {
    var stops = dr.state.stops;
    if (stops.length < 2) return null;

    var origin = stops[0];
    var destination = stops[stops.length - 1];
    var waypoints = stops.slice(1, -1);

    var params = new URLSearchParams();
    params.set('api', '1');
    params.set('travelmode', 'driving');
    params.set('origin', origin.lat + ',' + origin.lng);
    params.set('destination', destination.lat + ',' + destination.lng);

    if (waypoints.length > 0) {
      params.set('waypoints', waypoints.map(function(stop) {
        return stop.lat + ',' + stop.lng;
      }).join('|'));
    }

    return 'https://www.google.com/maps/dir/?' + params.toString();
  };

  dr.openGoogleMaps = function() {
    var url = dr.googleMapsUrl();
    if (!url) {
      dr.showMessage('Add at least two portals first.');
      return;
    }

    if (dr.state.stops.length > 10) {
      dr.showMessage('Google Maps may reject routes with too many stops. Try fewer than 10 stops for now.');
    }

    window.open(url, '_blank', 'noopener');
  };

  dr.setBusy = function(isBusy) {
    var panel = document.getElementById('driving-route-panel');
    if (panel) panel.classList.toggle('driving-route-busy', !!isBusy);
  };

  dr.showMessage = function(message) {
    var node = document.getElementById('driving-route-message');
    if (node) {
      node.textContent = message;
      node.classList.add('driving-route-message-visible');
      window.setTimeout(function() {
        node.classList.remove('driving-route-message-visible');
      }, 5000);
    } else {
      console.log('Driving Route:', message);
    }
  };

    dr.isDesktopLayout = function() {
    return window.matchMedia &&
      window.matchMedia('(min-width: 701px)').matches;
  };

  dr.enablePanelDragging = function(panel) {
    var header = panel.querySelector('.driving-route-header');
    if (!header) return;
    if (header.dataset.dragEnabled === 'true') return;

    header.dataset.dragEnabled = 'true';

    var dragging = false;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;

    header.addEventListener('mousedown', function(ev) {
      if (!dr.isDesktopLayout()) return;
      if (ev.target.closest('button, a, input, select, textarea')) return;

      dragging = true;
      startX = ev.clientX;
      startY = ev.clientY;

      var rect = panel.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;

      panel.style.left = startLeft + 'px';
      panel.style.top = startTop + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';

      ev.preventDefault();
    });

    window.addEventListener('mousemove', function(ev) {
      if (!dragging) return;

      var newLeft = startLeft + ev.clientX - startX;
      var newTop = startTop + ev.clientY - startY;

      newLeft = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, newLeft));
      newTop = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, newTop));

      panel.style.left = newLeft + 'px';
      panel.style.top = newTop + 'px';
    });

    window.addEventListener('mouseup', function() {
      dragging = false;
      dr.savePanelPosition(panel);
    });
  };

  dr.createPanel = function() {
    if (document.getElementById('driving-route-panel')) return;

    var panel = document.createElement('div');
    panel.id = 'driving-route-panel';
    panel.className = 'driving-route-panel';
    document.body.appendChild(panel);

    dr.restorePanelPosition(panel);

    panel.addEventListener('click', function(ev) {
      var target = ev.target;
      var action = target && target.getAttribute('data-action');
      if (!action) return;

      if (action === 'toggle-panel') {
        dr.state.panelOpen = !dr.state.panelOpen;
        dr.savePanelOpen();
        dr.renderPanel();
      } else if (action === 'move-stop-up') {
        dr.moveStop(Number(target.getAttribute('data-index')), Number(target.getAttribute('data-index')) - 1);
      } else if (action === 'move-stop-down') {
        dr.moveStop(Number(target.getAttribute('data-index')), Number(target.getAttribute('data-index')) + 1);
      } else if (action === 'remove-stop') {
        dr.removeStop(Number(target.getAttribute('data-index')));
      } else if (action === 'calculate-route') {
        dr.calculateRoute();
      } else if (action === 'open-google-maps') {
        dr.openGoogleMaps();
      } else if (action === 'clear-route') {
        dr.clearStops();
      }
    });

    panel.addEventListener('dragstart', function(ev) {
      if (!dr.isDesktopLayout()) return;

      var item = ev.target.closest('.driving-route-stop');
      if (!item) return;

      dr.state.dragStopIndex = Number(item.getAttribute('data-index'));
      ev.dataTransfer.effectAllowed = 'move';
      item.classList.add('driving-route-dragging');
    });

    panel.addEventListener('dragend', function(ev) {
      var item = ev.target.closest('.driving-route-stop');
      if (item) item.classList.remove('driving-route-dragging');
      dr.state.dragStopIndex = null;
    });

    panel.addEventListener('dragover', function(ev) {
      if (!dr.isDesktopLayout()) return;

      var item = ev.target.closest('.driving-route-stop');
      if (!item) return;

      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'move';
    });

    panel.addEventListener('drop', function(ev) {
      if (!dr.isDesktopLayout()) return;

      var item = ev.target.closest('.driving-route-stop');
      if (!item) return;

      ev.preventDefault();

      var fromIndex = dr.state.dragStopIndex;
      var toIndex = Number(item.getAttribute('data-index'));
      dr.state.dragStopIndex = null;

      dr.moveStop(fromIndex, toIndex);
    });

    panel.addEventListener('change', function(ev) {
      var target = ev.target;
      if (target && target.getAttribute('data-field') === 'default-stop-minutes') {
        var value = Math.max(0, Number(target.value || 0));
        dr.state.settings.defaultStopMinutes = value;
        dr.saveSettings();
        if (dr.state.route && dr.state.route.legs) {
          dr.state.route.totals = dr.calculateTotals(dr.state.route.legs);
        }
        dr.renderPanel();
      }
    });
  };

  dr.addToolboxLink = function() {
    if (!document.getElementById('toolbox')) return;
    if (document.getElementById('driving-route-toolbox-link')) return;

    var link = document.createElement('a');
    link.id = 'driving-route-toolbox-link';
    link.href = '#';
    link.textContent = 'Driving Route';
    link.addEventListener('click', function(ev) {
      ev.preventDefault();
      dr.state.panelOpen = true;
      dr.savePanelOpen();
      dr.renderPanel();
    });

    var toolbox = document.getElementById('toolbox');
    toolbox.appendChild(link);
  };

  dr.injectCss = function() {
    if (document.getElementById('driving-route-css')) return;
    var style = document.createElement('style');
    style.id = 'driving-route-css';
    style.textContent = dr.CSS;
    document.head.appendChild(style);
  };

  dr.setup = function() {
    try {
      dr.injectCss();
      dr.loadState();
      dr.createPanel();
      dr.addToolboxLink();
      dr.renderPanel();
      dr.redrawLabels();

      if (typeof window.addHook === 'function' && !dr.portalHookRegistered) {
        window.addHook('portalDetailsUpdated', dr.injectPortalDetailsAction);
        dr.portalHookRegistered = true;
      }

      console.log('Driving Route setup complete');
    } catch (e) {
      console.error('Driving Route setup failed:', e);
    }
  };

  dr.savePanelPosition = function(panel) {
  if (!panel || !dr.isDesktopLayout()) return;

  var rect = panel.getBoundingClientRect();
  localStorage.setItem(dr.STORAGE_KEYS.panelPosition, JSON.stringify({
    left: Math.round(rect.left),
    top: Math.round(rect.top)
  }));
};

dr.restorePanelPosition = function(panel) {
  if (!panel || !dr.isDesktopLayout()) return;

  try {
    var raw = localStorage.getItem(dr.STORAGE_KEYS.panelPosition);
    if (!raw) return;

    var pos = JSON.parse(raw);
    if (typeof pos.left !== 'number' || typeof pos.top !== 'number') return;

    panel.style.left = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, pos.left)) + 'px';
    panel.style.top = Math.max(0, Math.min(window.innerHeight - panel.offsetHeight, pos.top)) + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  } catch (e) {
    console.warn('Driving Route: failed to restore panel position', e);
  }
};


  var setup = dr.setup;

  setup.info = plugin_info;
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded && typeof setup === 'function') setup();
}

var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  };
}
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
