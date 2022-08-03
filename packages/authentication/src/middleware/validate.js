const jwt = require('jsonwebtoken');
const util = require('util');

const {
  authenticationErrorTokenExpired,
  authenticationErrorTokenInvalid,
  authenticationErrorTokenNotBefore,
} = require('./errors');

const verify = util.promisify(jwt.verify);

exports.validate = async (authenticationToken) => {
  try {
    await verify(authenticationToken, process.env.AUTHENTICATION_SECRET);
    return null;
  } catch(err) {
    switch(err.name) {
      case 'TokenExpiredError': return authenticationErrorTokenExpired(err);
      case 'JsonWebTokenError': return authenticationErrorTokenInvalid(err);
      case 'NotBeforeError': return authenticationErrorTokenNotBefore(err);
      default: return authenticationErrorTokenInvalid(err);
    }
  }
};
