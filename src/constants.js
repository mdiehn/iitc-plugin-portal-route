  dr.ID = 'driving-route';
  dr.NAME = 'Driving Route';
  dr.VERSION = '0.1.0-dev';

  dr.DOM_IDS = {
    css: 'iitc-plugin-driving-route-css',
    dialog: 'iitc-plugin-driving-route-dialog',
    dialogContent: 'iitc-plugin-driving-route-dialog-content',
    miniControl: 'iitc-plugin-driving-route-mini-control',
    toolboxLink: 'iitc-plugin-driving-route-toolbox-link'
  };

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
