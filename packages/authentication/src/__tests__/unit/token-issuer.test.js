import test from 'ava';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

import { tokenIssuer } from '../../token-issuer.js';

test.before('setup necessary environment variables', t => {
  process.env.AUTHENTICATION_SECRET = 'authentication-secret-test.middleware';
});

test('must generate a jwt token that expires in 7 days, and sign it with current environment authentication secret', t => {
  const user = { id: '123' };
  const authenticationToken = tokenIssuer.sign(user);

  // Assertions
  t.truthy(authenticationToken);
  t.notThrows(() => jwt.verify(authenticationToken, process.env.AUTHENTICATION_SECRET)); // certify validaty of token signature

  const decodedToken = jwt.decode(authenticationToken, { json: true });
  const { exp, iss, payload, sub } = decodedToken;
  const jwtStandardExpirationDate = dayjs('1970-01-01T00:00:00Z'); // https://github.com/auth0/node-jsonwebtoken#token-expiration-exp-claim

  t.assert(jwtStandardExpirationDate.add(exp, 'second').date() === dayjs().add(7, 'day').date());
  t.assert(iss === '@leonardosarmentocastro/authentication');
  t.deepEqual(payload, user);
  t.assert(sub === user.id);
});

test('must sign authenticated user\'s data to token payload', t => {
  const user = { id: '123', name: 'Leonardo', cellphoneNumber: '5511000002222' };
  const authenticationToken = tokenIssuer.sign(user);
  t.truthy(authenticationToken);

  const decodedToken = jwt.decode(authenticationToken, { json: true });
  const { payload } = decodedToken;
  t.deepEqual(payload, user);
});
