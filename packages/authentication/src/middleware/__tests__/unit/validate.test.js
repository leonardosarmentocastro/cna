const test = require('ava');
const jwt = require('jsonwebtoken');

const { validate } = require('../../validate');
const {
  authenticationErrorTokenExpired,
  authenticationErrorTokenInvalid,
  authenticationErrorTokenNotBefore
} = require('../../errors');

test.before('setup necessary environment variables', t => {
  process.env.AUTHENTICATION_SECRET = 'authentication-secret-test.validate';
});

test(`must return a mapped translation error in case JWT verification fails due to token expired`, async t => {
  const authenticationToken = jwt.sign({}, process.env.AUTHENTICATION_SECRET, { expiresIn: '1ms' });
  const err = await validate(authenticationToken);

  t.deepEqual(err, authenticationErrorTokenExpired(err));
});

test(`must return a mapped translation error in case JWT verification fails due to signature mismatch`, async t => {
  const authenticationToken = jwt.sign({}, 'invalid-secret', { expiresIn: '1h' });
  const err = await validate(authenticationToken);

  t.deepEqual(err, authenticationErrorTokenInvalid({ message: 'invalid signature' }));
});

test(`must return a mapped translation error in case JWT verification fails due to valid token being used prematurely`, async t => {
  const authenticationToken = jwt.sign({}, process.env.AUTHENTICATION_SECRET, { notBefore: '1h' }); // can only be used after 1 hour
  const err = await validate(authenticationToken);

  t.deepEqual(err, authenticationErrorTokenNotBefore(err));
});
