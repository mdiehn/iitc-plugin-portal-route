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
