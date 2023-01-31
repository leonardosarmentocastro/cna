import test from 'ava';
import got from 'got';
import jwt from 'jsonwebtoken';
import server from '@leonardosarmentocastro/server';
import i18n from '@leonardosarmentocastro/i18n';
import { database } from '@leonardosarmentocastro/database';

import { connect } from '../../../connect.js';
import { VALID_DOC } from '../../../__fixtures__/index.js';
import { TestingModel } from '../../../defaults.js';

// Setup
const PORT = 8080;
const URL = `http://127.0.0.1:${PORT}/authentication/sign-up`;
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
test('(200) must succeed on creating the authentication doc and signing a jwt token for it', async t => {
  t.assert((await getDocsSavedOnDatabase(t)).length === 0);

  const payload = VALID_DOC;
  const response = await got.post(URL, { json: payload });

  t.assert(response.statusCode == 200);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const [ type, authenticationToken ] = response.headers.authorization.trim().split(' ');
  t.assert(type === 'Bearer');
  t.truthy(authenticationToken);
  t.notThrows(() => jwt.verify(authenticationToken, process.env.AUTHENTICATION_SECRET));

  const decodedToken = jwt.decode(authenticationToken, { json: true });
  const id = decodedToken.sub;
  const foundDoc = await t.context.model.findById(id);
  t.truthy(foundDoc.authentication.tokens.some(token => authenticationToken === token));
});
