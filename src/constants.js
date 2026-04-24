  dr.ID = 'driving-route';
  dr.NAME = 'Driving Route';
  dr.VERSION = '0.1.0-dev';

  dr.STORAGE_KEYS = {
    stops: 'iitc-driving-route-stops',
    settings: 'iitc-driving-route-settings',
    panelOpen: 'iitc-driving-route-panel-open'
  };

  dr.DEFAULT_SETTINGS = {
    defaultStopMinutes: 5,
    includeReturnToStart: false
  };
