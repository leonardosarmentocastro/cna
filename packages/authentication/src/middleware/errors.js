import dayjs from 'dayjs';

// https://github.com/auth0/node-jsonwebtoken#tokenexpirederror
export const authenticationErrorTokenExpired = (err) => ({
  code: 'AUTHENTICATION_ERROR_TOKEN_EXPIRED',
  expiredAt: dayjs(err.expiredAt).toISOString() , // 1408621000 -> "1970-01-17T07:17:01.000Z"
});

// https://github.com/auth0/node-jsonwebtoken#jsonwebtokenerror
export const authenticationErrorTokenInvalid = (err) => ({
  code: 'AUTHENTICATION_ERROR_TOKEN_INVALID',
  jwtMessage: err.message, // NOTE: Not using prop "message" as it's used to serve translated messages.
});

// https://github.com/auth0/node-jsonwebtoken#notbeforeerror
export const authenticationErrorTokenNotBefore = (err) => ({
  code: 'AUTHENTICATION_ERROR_TOKEN_NOT_BEFORE',
  date: err.date, // "2018-10-04T16:10:44.000Z"
});
