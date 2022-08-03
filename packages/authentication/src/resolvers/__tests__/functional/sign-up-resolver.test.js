const test = require('ava');
const got = require('got');
const jwt = require('jsonwebtoken');
const server = require('@leonardosarmentocastro/server');
const i18n = require('@leonardosarmentocastro/i18n');
const { database } = require('@leonardosarmentocastro/database');

const { DEFAULTS } = require('../../../defaults');
const { connect } = require('../../../connect');

// Setup
const PORT = 8080;
const URL = `http://127.0.0.1:${PORT}/authentication/sign-up`;
const VALID_DOC = { email: 'valid-email@domain.com', password: 'v@l1dpAssw0rD' };
test.before('set required environment variables', t => {
  process.env.AUTHENTICATION_SECRET = 'any secret';
});
test.before('prepare: start api / connect to database', async t => {
  await database.connect();

  t.context.model = DEFAULTS.model;
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

  const response = await got.post(URL, { json: VALID_DOC });

  t.assert(response.statusCode == 200);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const authenticationToken = response.headers.authorization;
  t.truthy(authenticationToken);
  t.notThrows(() => jwt.verify(authenticationToken, process.env.AUTHENTICATION_SECRET));
});
