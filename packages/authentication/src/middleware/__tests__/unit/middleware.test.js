import test from 'ava';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

import { authenticationMiddleware } from '../../middleware.js';

test.before('setup necessary environment variables', t => {
  process.env.AUTHENTICATION_SECRET = 'authentication-secret-test.middleware';
});

test('must attach decoded data from authorization token to "req.authentication"', async t => {
  const authenticationToken = jwt.sign({
    payload: { role: 'admin' },
  },
  process.env.AUTHENTICATION_SECRET, {
    expiresIn: '1h',
    issuer: 'authentication-middleware',
    subject: 'userId.123456',
  });
  const req = { header: () => `Bearer ${authenticationToken}` };

  await authenticationMiddleware(req, () => null, () => null);

  const decodedToken = jwt.decode(authenticationToken, { json: true });
  t.deepEqual(req.authentication, {
    expirationTime: dayjs(decodedToken.exp).toISOString(),
    issuer: 'authentication-middleware',
    issuedAt: dayjs(decodedToken.iat).toISOString(),
    subject: 'userId.123456',
    payload: { role: 'admin' },
  });
});
