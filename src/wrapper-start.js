function wrapper(plugin_info) {
  if (typeof window.plugin !== 'function') window.plugin = function() {};
  window.plugin.drivingRoute = window.plugin.drivingRoute || {};

  var dr = window.plugin.drivingRoute;
