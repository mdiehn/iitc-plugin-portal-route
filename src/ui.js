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