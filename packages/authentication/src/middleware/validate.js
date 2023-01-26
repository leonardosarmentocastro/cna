import jwt from 'jsonwebtoken';
import util from 'util';

import {
  authenticationErrorTokenExpired,
  authenticationErrorTokenInvalid,
  authenticationErrorTokenNotBefore,
} from './errors.js';

const verify = util.promisify(jwt.verify);

export const validate = async (authenticationToken) => {
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
