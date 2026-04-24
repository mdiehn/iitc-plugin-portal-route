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
