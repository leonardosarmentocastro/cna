const { AUTHORIZATION_ERROR_INVALID_TOKEN } = require('./errors');

exports.validate = (req) => {
  const { isAccessingPublicRoute } = req.authorization;
  const authorizationToken = req.header('Authorization'); // "Bearer 123456"

  const isValidAuthorizationToken = (
    !!authorizationToken &&
    authorizationToken === process.env.AUTHORIZATION_TOKEN
  );

  switch(true) {
    case isAccessingPublicRoute: return null;
    case !isAccessingPublicRoute && isValidAuthorizationToken: return null;
    case !isAccessingPublicRoute && !isValidAuthorizationToken: return AUTHORIZATION_ERROR_INVALID_TOKEN;
    default: return null;
  }
};
