import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

import { translatedError } from '../errors.js';
import { validate } from './validate.js';

// TODO: functional test it.
export const authenticationMiddleware = async (req, res, next) => {
  const [ type, authenticationToken ] = req.header('Authorization').trim().split(' ');

  const err = await validate(authenticationToken);
  if (err) return translatedError(req, res, { err });

  // Reference:
  // "Registered claims": https://tools.ietf.org/html/rfc7519#section-4.1
  // "NumericDate": https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim
  const decodedToken = jwt.decode(authenticationToken, { json: true });
  req.authentication = {
    expirationTime: dayjs(decodedToken.exp).toISOString(), // NumericDate (1408621000 -> "1970-01-17T07:17:01.000Z")
    issuer: decodedToken.iss, // String ("CREATE_NODEJS_APP/AUTHENTICATION")
    issuedAt: dayjs(decodedToken.iat).toISOString(), // NumericDate (1408621000 -> "1970-01-17T07:17:01.000Z")
    subject: decodedToken.sub, // ObjectId (which refers to "userId")
    payload: decodedToken.payload // Anything serializable.
  };

  next();
};
