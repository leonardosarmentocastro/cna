const ROUTE_AUTHENTICATION_SIGN_IN = { method: 'post', url: '/authentication/sign-in' };
const ROUTE_AUTHENTICATION_SIGN_UP = { method: 'post', url: '/authentication/sign-up' };
const ROUTE_CORS_VERIFICATION = { method: 'options' };
const ROUTE_HEALTH_CHECK = { method: 'get', url: '/health' };
const ROUTE_SERVER_ENTRYPOINT = { method: 'get', url: '/' };

const DEFAULT_OPTIONS = {
  allowAuthentication: false,
  allowCORS: false,
  allowHealthCheck: true,
  allowServerEntrypoint: true,
};

// TODO: maybe add a test to ensure that every key present here has a default value?
// Dictionary to map `option:routes`
const ROUTES_FOR_OPTION = {
  allowAuthentication: [ ROUTE_AUTHENTICATION_SIGN_IN, ROUTE_AUTHENTICATION_SIGN_UP ],
  allowCORS: [ ROUTE_CORS_VERIFICATION ],
  allowHealthCheck: [ ROUTE_HEALTH_CHECK ],
  allowServerEntrypoint: [ ROUTE_SERVER_ENTRYPOINT ],
};

module.exports = {
  DEFAULT_OPTIONS,
  ROUTE_AUTHENTICATION_SIGN_IN,
  ROUTE_AUTHENTICATION_SIGN_UP,
  ROUTE_CORS_VERIFICATION,
  ROUTE_HEALTH_CHECK,
  ROUTE_SERVER_ENTRYPOINT,
  ROUTES_FOR_OPTION,
};
