  pr.portalToStop = function(guid) {
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

  pr.clearIitcPortalSelection = function() {
    var cleared = false;

    if (typeof window.renderPortalDetails === 'function') {
      try {
        window.renderPortalDetails(null);
        cleared = true;
      } catch (e) {
        console.warn('Portal Route: unable to clear IITC portal details via renderPortalDetails', e);
      }
    }

    if (!cleared && typeof window.selectPortal === 'function') {
      try {
        window.selectPortal(null, 'portal-route-map-point');
        cleared = true;
      } catch (e2) {
        console.warn('Portal Route: unable to clear IITC portal selection via selectPortal', e2);
      }
    }

    if (!cleared) {
      window.selectedPortal = null;
    }

    var details = document.getElementById('portaldetails');
    if (details) details.innerHTML = '';

    if (typeof window.setPortalIndicators === 'function') {
      try {
        window.setPortalIndicators(null);
      } catch (e3) {
        console.warn('Portal Route: unable to clear IITC portal indicators', e3);
      }
    }
  };

  pr.addSelectedPortal = function() {
    var guid = window.selectedPortal;
    var stop = pr.portalToStop(guid);
    if (!stop) {
      pr.showMessage('No selected portal found.');
      return;
    }
    pr.addStop(stop);
  };

  pr.selectedPortalStopIndex = function() {
    var guid = window.selectedPortal;
    if (!guid) return -1;

    for (var i = 0; i < pr.state.stops.length; i++) {
      if (pr.state.stops[i] && pr.state.stops[i].guid === guid) return i;
    }

    return -1;
  };

  pr.selectedInfoPanelStopIndex = function() {
    var mapPointIndex = pr.selectedMapPointIndex ? pr.selectedMapPointIndex() : -1;
    if (mapPointIndex >= 0) return mapPointIndex;

    return pr.selectedPortalStopIndex();
  };

  pr.removePortalDetailsAction = function() {
    var existing = document.querySelector('.portal-route-portal-action');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  };

  pr.portalDetailsActionAnchor = function(container) {
    if (!container || !document.createTreeWalker) return null;

    var nodeFilter = window.NodeFilter;
    if (!nodeFilter) return null;
    var walker = document.createTreeWalker(container, nodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        return node.nodeValue && node.nodeValue.indexOf('History:') >= 0
          ? nodeFilter.FILTER_ACCEPT
          : nodeFilter.FILTER_SKIP;
      }
    });
    var node = walker.nextNode();
    if (!node) return null;

    while (node && node.parentNode && node.parentNode !== container) {
      node = node.parentNode;
    }

    return node && node.parentNode === container ? node : null;
  };

  pr.placePortalDetailsAction = function(container, wrapper) {
    var anchor = pr.portalDetailsActionAnchor(container);
    var next = anchor ? anchor.nextSibling : null;

    if (next !== wrapper) container.insertBefore(wrapper, next);
  };

  pr.injectPortalDetailsAction = function() {
    var container = document.querySelector('#portaldetails');
    if (!container) return;

    if (!pr.state.settings.showPortalDetailsControls) {
      pr.removePortalDetailsAction();
      return;
    }

    var wrapper = container.querySelector('.portal-route-portal-action');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'portal-route-portal-action';
      container.appendChild(wrapper);
    }
    pr.placePortalDetailsAction(container, wrapper);

    var selectedIndex = pr.selectedInfoPanelStopIndex();
    var isInRoute = selectedIndex >= 0;
    var hasSelectedMapPoint = pr.selectedMapPointIndex && pr.selectedMapPointIndex() >= 0;

    wrapper.innerHTML = '';

    var header = document.createElement('div');
    header.className = 'portal-route-portal-action-title';
    header.textContent = 'Portal Route';
    wrapper.appendChild(header);

    var links = document.createElement('div');
    links.className = 'portal-route-portal-action-links';

    function addActionLink(label, handler) {
      var link = document.createElement('a');
      link.href = '#';
      link.textContent = label;
      if (label === 'Action') {
        link.className = 'portal-route-smart-button';
        link.setAttribute('data-add-menu', 'true');
      }
      link.addEventListener('click', function(ev) {
        ev.preventDefault();
        handler();
      });
      links.appendChild(link);
      return link;
    }

    if (isInRoute || window.selectedPortal || !hasSelectedMapPoint) addActionLink('Action', function() {
      var rect = links.getBoundingClientRect();
      pr.openAddMenu(rect.left, rect.bottom + 4);
    });

    addActionLink('Maps', function() {
      pr.openGoogleMaps();
    });

    var menuLink = addActionLink('Menu', function() {
      var rect = links.getBoundingClientRect();
      pr.openRouteMenu(rect.left, rect.bottom + 4);
    });
    menuLink.className = 'portal-route-smart-button';
    menuLink.setAttribute('data-route-menu', 'true');

    wrapper.appendChild(links);
  };
