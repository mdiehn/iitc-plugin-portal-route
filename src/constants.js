  pr.ID = 'portal-route';
  pr.NAME = 'Portal Route';
  pr.VERSION = '1.2.0';
  pr.SHOW_VERSION_IN_PANEL = true;

  pr.DOM_IDS = {
    css: 'iitc-plugin-portal-route-css',
    dialog: 'iitc-plugin-portal-route-dialog',
    dialogContent: 'iitc-plugin-portal-route-dialog-content',
    pointsDialog: 'iitc-plugin-portal-route-points-dialog',
    pointsDialogContent: 'iitc-plugin-portal-route-points-dialog-content',
    routeLibrary: 'iitc-plugin-portal-route-library-dialog',
    routeLibraryContent: 'iitc-plugin-portal-route-library-dialog-content',
    bulkSelectDialog: 'iitc-plugin-portal-route-bulk-select-dialog',
    bulkSelectDialogContent: 'iitc-plugin-portal-route-bulk-select-dialog-content',
    miniControl: 'iitc-plugin-portal-route-mini-control',
    toolboxLink: 'iitc-plugin-portal-route-toolbox-link'
  };

  pr.STORAGE_KEYS = {
    stops: 'iitc-portal-route-stops',
    settings: 'iitc-portal-route-settings',
    panelOpen: 'iitc-portal-route-panel-open',
    panelPosition: 'iitc-portal-route-panel-position',
    panelSize: 'iitc-portal-route-panel-size',
    panelSizeUserSet: 'iitc-portal-route-panel-size-user-set',
    route: 'iitc-portal-route-route',
    routeDirty: 'iitc-portal-route-route-dirty',
    routeLibrary: 'iitc-portal-route-library',
    routeLibraryDriveCache: 'iitc-portal-route-drive-library-cache',
    routeLibraryDriveFolderId: 'iitc-portal-route-drive-folder-id',
    routeLibraryDriveFolderName: 'iitc-portal-route-drive-folder-name',
    routeLibraryDriveFileId: 'iitc-portal-route-drive-file-id'
  };

  pr.TRAVEL_MODES = {
    drive: 'drive',
    bike: 'bike',
    walk: 'walk'
  };

  pr.DEFAULT_SETTINGS = {
    defaultStopMinutes: 5,
    includeReturnToStart: false,
    startOnCurrentLocation: false,
    defaultTravelMode: pr.TRAVEL_MODES.drive,
    driveSpeedMph: 30,
    bikeSpeedMph: 10,
    walkSpeedMph: 3,
    googleDriveOAuthClientId: '',
    showSegmentTimesOnMap: false,
    showMiniControl: true,
    showPortalDetailsControls: true
  };
