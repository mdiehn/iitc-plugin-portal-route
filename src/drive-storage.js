  pr.DRIVE_LIBRARY_FILE_NAME = 'route-library.json';
  pr.DRIVE_DEFAULT_FOLDER_NAME = 'IITC Portal Route';
  pr.DRIVE_API_SCRIPT = 'https://apis.google.com/js/api.js';
  pr.DRIVE_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
  pr.DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

  pr.driveState = {
    apiLoading: false,
    apiLoaded: false,
    authorizing: false,
    authorized: false,
    folderId: null,
    folderName: null,
    fileId: null,
    lastError: null,
    pushTimer: null
  };

  pr.getSyncPlugin = function() {
    return window.plugin && window.plugin.sync ? window.plugin.sync : null;
  };

  pr.loadDriveState = function() {
    pr.driveState.folderId = localStorage.getItem(pr.STORAGE_KEYS.routeLibraryDriveFolderId) || null;
    pr.driveState.folderName = localStorage.getItem(pr.STORAGE_KEYS.routeLibraryDriveFolderName) || pr.DRIVE_DEFAULT_FOLDER_NAME;
    pr.driveState.fileId = localStorage.getItem(pr.STORAGE_KEYS.routeLibraryDriveFileId) || null;
  };

  pr.saveDriveState = function() {
    if (pr.driveState.folderId) {
      localStorage.setItem(pr.STORAGE_KEYS.routeLibraryDriveFolderId, pr.driveState.folderId);
    } else {
      localStorage.removeItem(pr.STORAGE_KEYS.routeLibraryDriveFolderId);
    }

    if (pr.driveState.folderName) {
      localStorage.setItem(pr.STORAGE_KEYS.routeLibraryDriveFolderName, pr.driveState.folderName);
    } else {
      localStorage.removeItem(pr.STORAGE_KEYS.routeLibraryDriveFolderName);
    }

    if (pr.driveState.fileId) {
      localStorage.setItem(pr.STORAGE_KEYS.routeLibraryDriveFileId, pr.driveState.fileId);
    } else {
      localStorage.removeItem(pr.STORAGE_KEYS.routeLibraryDriveFileId);
    }
  };

  pr.loadDriveRouteLibraryCache = function() {
    var raw = localStorage.getItem(pr.STORAGE_KEYS.routeLibraryDriveCache);
    if (!raw) return pr.emptyRouteLibrary();

    try {
      return pr.normalizeRouteLibrary(JSON.parse(raw));
    } catch (e) {
      console.warn('Portal Route: failed to load Drive route library cache', e);
      return pr.emptyRouteLibrary();
    }
  };

  pr.saveDriveRouteLibraryCache = function(library) {
    library = pr.normalizeRouteLibrary(library);
    library.updatedAt = pr.routeLibraryNow();
    localStorage.setItem(pr.STORAGE_KEYS.routeLibraryDriveCache, JSON.stringify(library));
    return library;
  };

  pr.getDriveOAuthClientId = function() {
    var settings = pr.state && pr.state.settings ? pr.state.settings : null;
    return settings && typeof settings.googleDriveOAuthClientId === 'string'
      ? settings.googleDriveOAuthClientId.trim()
      : '';
  };

  pr.getGoogleAuthInstance = function() {
    if (!window.gapi || !window.gapi.auth2 || !window.gapi.auth2.getAuthInstance) return null;
    try {
      return window.gapi.auth2.getAuthInstance();
    } catch (e) {
      return null;
    }
  };

  pr.hasSyncDriveSession = function() {
    return !!(pr.getSyncPlugin() && pr.getGoogleAuthInstance());
  };

  pr.getDriveAuthSource = function() {
    if (pr.hasSyncDriveSession()) return 'sync';
    if (pr.getDriveOAuthClientId()) return 'settings';
    return null;
  };

  pr.driveOAuthClientIdRequiredMessage = function() {
    return 'Google Drive needs IITC Sync Google auth or a Portal Route OAuth Client ID in settings.';
  };

  pr.driveActionErrorMessage = function(prefix, error) {
    var detail = error && error.message ? error.message : prefix;
    return prefix === detail ? prefix : prefix + ': ' + detail;
  };

  pr.driveStatusText = function() {
    if (pr.driveState.lastError) return 'Drive: ' + pr.driveState.lastError;
    if (pr.isDriveReady()) return 'Drive: ' + (pr.driveState.folderName || pr.DRIVE_DEFAULT_FOLDER_NAME);
    if (pr.hasSyncDriveSession()) return 'Drive: using IITC Sync auth';
    if (!pr.getDriveOAuthClientId()) return 'Drive: Sync auth or OAuth Client ID required';
    if (pr.driveState.authorizing || pr.driveState.apiLoading) return 'Drive: connecting';
    if (pr.driveState.folderId) return 'Drive: reconnect needed';
    return 'Drive: not connected';
  };

  pr.isDriveReady = function() {
    return !!(pr.driveState.authorized && pr.driveState.folderId && pr.driveState.fileId);
  };

  pr.driveEscapeQueryValue = function(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  };

  pr.loadGoogleDriveApi = function() {
    if (pr.driveState.apiLoaded && window.gapi) return Promise.resolve();
    if (pr.driveApiPromise) return pr.driveApiPromise;

    pr.driveState.apiLoading = true;
    pr.driveState.lastError = null;

    pr.driveApiPromise = new Promise(function(resolve, reject) {
      var finish = function() {
        pr.driveState.apiLoading = false;
        pr.driveState.apiLoaded = true;
        resolve();
      };

      if (window.gapi) {
        finish();
        return;
      }

      var script = document.createElement('script');
      script.src = pr.DRIVE_API_SCRIPT;
      script.onload = finish;
      script.onerror = function() {
        pr.driveState.apiLoading = false;
        pr.driveApiPromise = null;
        reject(new Error('Could not load Google API.'));
      };
      document.head.appendChild(script);
    });

    return pr.driveApiPromise;
  };

  pr.loadDriveClientApi = function() {
    return new Promise(function(resolve, reject) {
      window.gapi.load('client', {
        callback: resolve,
        onerror: function() { reject(new Error('Could not initialize Google API client.')); }
      });
    }).then(function() {
      if (window.gapi.client && window.gapi.client.drive && window.gapi.client.drive.files) return;
      return window.gapi.client.load('drive', 'v3');
    });
  };

  pr.authorizeDrive = function() {
    pr.loadDriveState();
    var authSource = pr.getDriveAuthSource();
    var clientId = authSource === 'settings' ? pr.getDriveOAuthClientId() : '';
    if (!authSource) {
      var configError = new Error(pr.driveOAuthClientIdRequiredMessage());
      pr.driveState.authorized = false;
      pr.driveState.lastError = 'Sync auth or OAuth Client ID required';
      pr.refreshRouteLibraryPanel();
      return Promise.reject(configError);
    }

    pr.driveState.authorizing = true;
    pr.driveState.authorized = false;
    pr.driveState.lastError = null;
    pr.refreshRouteLibraryPanel();

    return pr.loadGoogleDriveApi()
      .then(function() {
        if (authSource === 'sync') return pr.loadDriveClientApi();
        return new Promise(function(resolve, reject) {
          window.gapi.load('client:auth2', {
            callback: resolve,
            onerror: function() { reject(new Error('Could not initialize Google auth.')); }
          });
        });
      })
      .then(function() {
        if (authSource === 'sync') return;
        return window.gapi.client.init({
          discoveryDocs: pr.DRIVE_DISCOVERY_DOCS,
          client_id: clientId,
          scope: pr.DRIVE_SCOPE
        });
      })
      .then(function() {
        var auth = pr.getGoogleAuthInstance();
        if (!auth) throw new Error('Google auth is not ready. Connect IITC Sync or enter a Portal Route OAuth Client ID.');
        if (auth.isSignedIn.get()) return true;
        return auth.signIn().then(function() { return true; });
      })
      .then(function() {
        pr.driveState.authorizing = false;
        pr.driveState.authorized = true;
        pr.refreshRouteLibraryPanel();
      })
      .catch(function(error) {
        pr.driveState.authorizing = false;
        pr.driveState.authorized = false;
        pr.driveState.lastError = error && error.message ? error.message : 'Drive connect failed.';
        pr.refreshRouteLibraryPanel();
        throw error;
      });
  };

  pr.promptDriveFolderName = function() {
    var current = pr.driveState.folderName || pr.DRIVE_DEFAULT_FOLDER_NAME;
    if (!window.prompt) return current;

    var name = window.prompt('Google Drive folder', current);
    if (name === null) return null;

    name = String(name).trim();
    return name || pr.DRIVE_DEFAULT_FOLDER_NAME;
  };

  pr.ensureDriveFolder = function(forcePrompt) {
    var promptedName = forcePrompt || !pr.driveState.folderName ? pr.promptDriveFolderName() : pr.driveState.folderName;
    if (promptedName === null) return Promise.reject(new Error('Drive folder not selected.'));

    pr.driveState.folderName = promptedName;
    pr.saveDriveState();

    if (pr.driveState.folderId && !forcePrompt) return Promise.resolve(pr.driveState.folderId);

    var name = pr.driveEscapeQueryValue(pr.driveState.folderName);
    var q = "name = '" + name + "' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";

    return window.gapi.client.drive.files.list({
      q: q,
      fields: 'files(id,name,modifiedTime)',
      pageSize: 10
    }).then(function(response) {
      var folders = response.result && response.result.files ? response.result.files : [];
      if (folders.length) {
        pr.driveState.folderId = folders[0].id;
        pr.saveDriveState();
        return pr.driveState.folderId;
      }

      return window.gapi.client.drive.files.create({
        fields: 'id',
        resource: {
          name: pr.driveState.folderName,
          mimeType: 'application/vnd.google-apps.folder'
        }
      }).then(function(createResponse) {
        pr.driveState.folderId = createResponse.result.id;
        pr.saveDriveState();
        return pr.driveState.folderId;
      });
    });
  };

  pr.ensureDriveLibraryFile = function(forceFolderPrompt) {
    return pr.ensureDriveFolder(forceFolderPrompt).then(function(folderId) {
      if (pr.driveState.fileId && !forceFolderPrompt) return pr.driveState.fileId;

      var fileName = pr.driveEscapeQueryValue(pr.DRIVE_LIBRARY_FILE_NAME);
      var q = "name = '" + fileName + "' and trashed = false and '" + folderId + "' in parents";

      return window.gapi.client.drive.files.list({
        q: q,
        fields: 'files(id,name,modifiedTime)',
        pageSize: 10
      }).then(function(response) {
        var files = response.result && response.result.files ? response.result.files : [];
        if (files.length) {
          pr.driveState.fileId = files[0].id;
          pr.saveDriveState();
          return pr.driveState.fileId;
        }

        return window.gapi.client.drive.files.create({
          fields: 'id',
          resource: {
            name: pr.DRIVE_LIBRARY_FILE_NAME,
            mimeType: 'application/json',
            parents: [folderId]
          }
        }).then(function(createResponse) {
          pr.driveState.fileId = createResponse.result.id;
          pr.saveDriveState();
          return pr.writeDriveRouteLibrary(pr.loadDriveRouteLibraryCache());
        });
      });
    });
  };

  pr.readDriveRouteLibrary = function() {
    return pr.authorizeDrive().then(function() {
      return pr.ensureDriveLibraryFile();
    }).then(function() {
      return window.gapi.client.drive.files.get({
        fileId: pr.driveState.fileId,
        alt: 'media'
      });
    }).then(function(response) {
      var data = response.result;
      if (typeof data === 'string' && data) data = JSON.parse(data);
      var library = data && typeof data === 'object' ? pr.normalizeRouteLibrary(data) : pr.emptyRouteLibrary();
      pr.saveDriveRouteLibraryCache(library);
      pr.state.routeLibraryBackendId = 'googleDrive';
      pr.state.selectedLibraryRouteIds = [];
      pr.refreshRouteLibraryPanel();
      pr.showMessage('Drive library loaded.');
      return library;
    }).catch(function(error) {
      pr.driveState.lastError = error && error.message ? error.message : 'Drive load failed.';
      pr.refreshRouteLibraryPanel();
      pr.showMessage(pr.driveActionErrorMessage('Drive load failed.', error));
    });
  };

  pr.writeDriveRouteLibrary = function(library) {
    library = pr.saveDriveRouteLibraryCache(library);

    return window.gapi.client.request({
      path: '/upload/drive/v3/files/' + pr.driveState.fileId,
      method: 'PATCH',
      params: { uploadType: 'media' },
      body: JSON.stringify(library, null, 2)
    }).then(function() {
      pr.driveState.lastError = null;
      pr.refreshRouteLibraryPanel();
      return library;
    });
  };

  pr.pushDriveRouteLibrary = function() {
    return pr.authorizeDrive().then(function() {
      return pr.ensureDriveLibraryFile();
    }).then(function() {
      return pr.writeDriveRouteLibrary(pr.loadDriveRouteLibraryCache());
    }).then(function() {
      pr.showMessage('Drive library saved.');
    }).catch(function(error) {
      pr.driveState.lastError = error && error.message ? error.message : 'Drive save failed.';
      pr.refreshRouteLibraryPanel();
      pr.showMessage(pr.driveActionErrorMessage('Drive save failed.', error));
    });
  };

  pr.pushDriveRouteLibrarySoon = function() {
    if (pr.state.routeLibraryBackendId !== 'googleDrive') return;
    if (!pr.isDriveReady()) return;

    if (pr.driveState.pushTimer) window.clearTimeout(pr.driveState.pushTimer);
    pr.driveState.pushTimer = window.setTimeout(function() {
      pr.driveState.pushTimer = null;
      pr.pushDriveRouteLibrary();
    }, 500);
  };

  pr.connectDriveRouteLibrary = function() {
    pr.loadDriveState();
    return pr.authorizeDrive().then(function() {
      return pr.ensureDriveLibraryFile();
    }).then(function() {
      pr.state.routeLibraryBackendId = 'googleDrive';
      pr.refreshRouteLibraryPanel();
      pr.showMessage('Drive connected.');
    }).catch(function(error) {
      console.warn('Portal Route: Drive connect failed', error);
      pr.driveState.lastError = error && error.message ? error.message : 'Drive connect failed.';
      pr.refreshRouteLibraryPanel();
      pr.showMessage(pr.driveActionErrorMessage('Drive connect failed.', error));
    });
  };

  pr.chooseDriveRouteLibraryFolder = function() {
    pr.loadDriveState();
    pr.driveState.folderId = null;
    pr.driveState.fileId = null;
    pr.saveDriveState();

    return pr.authorizeDrive().then(function() {
      return pr.ensureDriveLibraryFile(true);
    }).then(function() {
      pr.state.routeLibraryBackendId = 'googleDrive';
      pr.refreshRouteLibraryPanel();
      pr.showMessage('Drive folder ready.');
    }).catch(function(error) {
      console.warn('Portal Route: Drive folder setup failed', error);
      pr.driveState.lastError = error && error.message ? error.message : 'Drive folder setup failed.';
      pr.refreshRouteLibraryPanel();
      pr.showMessage(pr.driveActionErrorMessage('Drive folder setup failed.', error));
    });
  };

  pr.loadDriveState();
