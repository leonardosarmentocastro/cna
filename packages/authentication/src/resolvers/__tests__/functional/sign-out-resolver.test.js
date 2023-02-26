import test from 'ava';
import got from 'got';
import jwt from 'jsonwebtoken';
import server from '@leonardosarmentocastro/server';
import i18n from '@leonardosarmentocastro/i18n';
import Mongoose from 'mongoose';
import { translate } from '@leonardosarmentocastro/i18n';
import { database } from '@leonardosarmentocastro/database';

import { connect } from '../../../connect.js';
import { VALID_DOC } from '../../../__fixtures__/index.js';
import { TestingModel } from '../../../defaults.js';
import { tokenIssuer } from '../../../token-issuer.js';
import { authenticationErrorRegistryForTokenNotFound } from '../../../errors.js';
import { validate } from '../../../middleware/index.js';

// Setup
const PORT = 8080;
const BASE_URL = `http://127.0.0.1:${PORT}/authentications/authentication`;
const URL = `${BASE_URL}/sign-out`;
const LOCALE = 'pt-br';
const HEADERS = { 'accept-language': LOCALE };
test.before('set required environment variables', t => {
  process.env.AUTHENTICATION_SECRET = 'any secret';
});
test.before('prepare: start api / connect to database', async t => {
  await database.connect();

  t.context.model = TestingModel;
  t.context.api = await server.start(PORT, {
    middlewares: (app) => {
      i18n.connect(app);
    },
    routes: (app) => {
      connect(app, t.context.model);
    },
  });
});

test.beforeEach('cleanup database', t => t.context.model.deleteMany());
test.after.always('teardown', t => t.context.api.close());

// Happy path tests
const getDocsSavedOnDatabase = (t) => t.context.model.find({});
test('(200) must succeed on removing an authentication token from a given authenticated registry', async t => {
  t.assert((await getDocsSavedOnDatabase(t)).length === 0);

  // signing up an registry
  const toAuthenticate = VALID_DOC;
  const response1 = await got.post(`${BASE_URL}/sign-up`, { json: toAuthenticate, headers: { ...HEADERS } });
  t.assert(response1.statusCode == 200);

  const [ type, authenticationToken ] = response1.headers.authorization.trim().split(' ');
  t.assert(type === 'Bearer');
  t.truthy(authenticationToken);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const decodedToken = jwt.decode(authenticationToken, { json: true });
  const id = decodedToken.sub;
  const authenticatedRegistry1 = await t.context.model.findById(id);

  const tokenExists = (registry) => registry.toObject({ sensitive: false }).authentication.tokens.some(token => token === authenticationToken);
  t.truthy(tokenExists(authenticatedRegistry1));

  // signing out a registry
  const response2 = await got.post(URL, {
    headers: { ...HEADERS, 'Authorization': `Bearer ${authenticationToken}` },
  });
  t.assert(response2.statusCode == 200);
  t.falsy(response2.headers.authorization);

  const authenticatedRegistry2 = await t.context.model.findById(id);
  t.falsy(tokenExists(authenticatedRegistry2));
});

test('(400) must return an error if an empty or invalid "authorization" header is set when trying to sign out', async t => {
  let failed = false;
  const emptyToken = '';

  try {
    // signing out using an empty token
    await got.post(URL, {
      headers: { ...HEADERS, 'Authorization': emptyToken },
    });
  } catch(error) {
    failed = true;

    const err = await validate(emptyToken);
    t.assert(error.response.statusCode == 401);
    t.deepEqual(
      JSON.parse(error.response.body),
      translate.error(err, LOCALE, {})
    );
  }

  t.truthy(failed);
  failed = false;

  // signing out using an invalid token (token is being verified using a different authentication secret)
  process.env.AUTHENTICATION_SECRET = 'original secret';
  const authenticationToken1 = tokenIssuer.sign({ id: new Mongoose.Types.ObjectId().toString() });
  process.env.AUTHENTICATION_SECRET = 'another secret';

  try {
    await got.post(URL, {
      headers: { ...HEADERS, 'Authorization': `Bearer ${authenticationToken1}` },
    });
  } catch(error) {
    failed = true;

    const err = await validate(authenticationToken1);
    t.assert(error.response.statusCode == 401);
    t.deepEqual(
      JSON.parse(error.response.body),
      translate.error(err, LOCALE, {})
    );
  }

  t.truthy(failed);
  failed = false;

  // signing out using whatever
  const invalidToken = 'whatever-token.123123123';

  try {
    await got.post(URL, {
      headers: { ...HEADERS, 'Authorization': `Bearer ${invalidToken}` },
    });
  } catch(error) {
    failed = true;

    const err = await validate(invalidToken);
    t.assert(error.response.statusCode == 401);
    t.deepEqual(
      JSON.parse(error.response.body),
      translate.error(err, LOCALE, {})
    );
  }

  t.truthy(failed);
});

test('(404) must throw an error if the signed user on "authorization" header does not exist by the time signing out is attempted', async t => {
  let failed = false;
  process.env.AUTHENTICATION_SECRET = 'original secret';

  const unknownUserId = new Mongoose.Types.ObjectId().toString();
  const authenticationToken = tokenIssuer.sign({ id: unknownUserId });

  try {
    await got.post(URL, {
      headers: { ...HEADERS, 'Authorization': `Bearer ${authenticationToken}` },
    });
  } catch(err) {
    failed = true;

    t.assert(err.response.statusCode == 404);
    t.deepEqual(
      JSON.parse(err.response.body),
      translate.error(authenticationErrorRegistryForTokenNotFound(authenticationToken), LOCALE, {})
    );
  }

  t.truthy(failed);
});
