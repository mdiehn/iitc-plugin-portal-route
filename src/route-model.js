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
