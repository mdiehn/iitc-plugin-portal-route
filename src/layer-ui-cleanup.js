(function() {
  function isPortalRouteLayerOff() {
    return pr.isLayerEnabled && !pr.isLayerEnabled();
  }

  function removePortalRouteInfoPanelControls() {
    if (pr.removePortalDetailsAction) pr.removePortalDetailsAction();
  }

  var originalInjectPortalDetailsAction = pr.injectPortalDetailsAction;
  if (typeof originalInjectPortalDetailsAction === 'function') {
    pr.injectPortalDetailsAction = function() {
      if (isPortalRouteLayerOff()) {
        removePortalRouteInfoPanelControls();
        return;
      }

      return originalInjectPortalDetailsAction.apply(this, arguments);
    };
  }

  var originalSyncLayerUi = pr.syncLayerUi;
  if (typeof originalSyncLayerUi === 'function') {
    pr.syncLayerUi = function() {
      var result = originalSyncLayerUi.apply(this, arguments);

      if (isPortalRouteLayerOff()) {
        removePortalRouteInfoPanelControls();
      }

      return result;
    };
  }

  var originalDisable = pr.disable;
  if (typeof originalDisable === 'function') {
    pr.disable = function() {
      var result = originalDisable.apply(this, arguments);
      removePortalRouteInfoPanelControls();
      return result;
    };
  }
})();
