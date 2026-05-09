  pr.calculateRoute = function() {
    var provider = pr.getRoutingProvider();

    if (provider === pr.ROUTING_PROVIDERS.ors) {
      if (pr.calculateOrsRoute) {
        pr.calculateOrsRoute();
        return;
      }

      pr.showMessage('OpenRouteService routing is not available in this build.');
      return;
    }

    pr.calculateGoogleRoute();
  };
