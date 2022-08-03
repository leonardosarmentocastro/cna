const { DEFAULT_OPTIONS, ROUTES_FOR_OPTION } = require('./constants');

const mergeOptions = (options) => // { "allowCors": true, "allowAuthorization": false }
  Object.entries({ ...DEFAULT_OPTIONS, ...options }) // [[ "allowCORS", true ], [ "allowAuthorization", false ]]
    .filter(([ key ]) => !!ROUTES_FOR_OPTION[key]); // disconsider unmapped options

const authorizationSanitizer = (allowedRoutes, options) =>
  mergeOptions(options) // [[ "allowCORS", true ], [ "allowAuthorization", false ]]
    .reduce((routesToAllow, [ key, isAllowed ]) => {
      const routesForOption = ROUTES_FOR_OPTION[key]; // [ { method: "options" } ]
      if (isAllowed) return [ ...routesToAllow, ...routesForOption ]; // consider all routes regarding that option

      return routesToAllow.filter(route => !routesForOption.includes(route)); // remove all routes that matches this option.
    }, allowedRoutes);

module.exports = { authorizationSanitizer, mergeOptions };
