const { validate } = require('./validate');
const { authorizationTranslatedError } = require('./errors');
const { authorizationSanitizer } = require('./sanitizer');

exports.authorizationMiddleware = (allowedRoutes, options) => {
  const routesToAllow = authorizationSanitizer(allowedRoutes, options);

  return (req, res, next) => {
    // [create-nodejs-app] TODO: unit tests
    const isCheckingCORS = req.method === 'OPTIONS';
    if (isCheckingCORS) return next();

    req.authorization = { // TODO: consume this information on "authentication" middleware.
      isAccessingPublicRoute: routesToAllow.some(route =>
        route.method === req.method.toLowerCase() &&
        route.url === req.url.toLowerCase()
      ),
    };

    const err = validate(req);
    if (err) return authorizationTranslatedError(req, res, { err });

    next();
  };
};
