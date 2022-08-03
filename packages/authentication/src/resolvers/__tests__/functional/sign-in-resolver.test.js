const test = require('ava');
const got = require('got');
const jwt = require('jsonwebtoken');
const i18n = require('@leonardosarmentocastro/i18n');
const server = require('@leonardosarmentocastro/server');
const { database } = require('@leonardosarmentocastro/database');
const { translate } = require('@leonardosarmentocastro/i18n');
const { isRequiredValidator } = require('@leonardosarmentocastro/validate');

const {
  AUTHENTICATION_ERROR_EMAIL_NOT_FOUND,
  AUTHENTICATION_ERROR_PASSWORD_MISMATCH,
} = require('../../../errors');
const { DEFAULTS } = require('../../../defaults');
const { connect } = require('../../../connect');

// Setup
const PORT = 8080;
const URL = `http://127.0.0.1:${PORT}/authentication/sign-in`;
const VALID_DOC = { email: 'valid-email@domain.com', password: 'v@l1dpAssw0rD' };
const LOCALE = 'pt-br';
const headers = { 'accept-language': LOCALE };
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
test.beforeEach('cleanup', t => t.context.model.deleteMany());
test.after.always('teardown', t => t.context.api.close());

// Happy path tests
const getDocsSavedOnDatabase = (t) => t.context.model.find({});
test('(200) must succeed on authenticating the user and signing a jwt token for it', async t => {
  await t.context.model.create(VALID_DOC);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const response = await got.post(URL, { json: VALID_DOC, headers });

  t.assert(response.statusCode == 200);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const authenticationToken = response.headers.authorization;
  t.truthy(authenticationToken);
  t.notThrows(() => jwt.verify(authenticationToken, process.env.AUTHENTICATION_SECRET));
});

// Unhappy path tests
[ 'email', 'password' ].forEach(field => {
  test(`(400) must return an error when not providing the field "${field}" on request body`, t => {
    const { email, password } = VALID_DOC;
    const authenticationPayload = { email, password, [field]: undefined };

    return got.post(URL, { json: authenticationPayload, headers })
      .catch(error => {
        const { validator, ...err } = isRequiredValidator(field)(authenticationPayload);

        t.assert(error.response.statusCode == 400);
        t.deepEqual(JSON.parse(error.response.body), translate.error(err, LOCALE, {}));
      });
  });
});

test('(404) must return an error when providing an "email" that is not registered for any user', t => {
  const email = `not-${VALID_DOC.email}`;
  const { password } = VALID_DOC;

  return got.post(URL, {
    json: { email, password },
    headers
  })
  .catch(error => {
    t.assert(error.response.statusCode == 404);
    t.deepEqual(JSON.parse(error.response.body), translate.error(AUTHENTICATION_ERROR_EMAIL_NOT_FOUND, LOCALE, {}));
  });
});

test('(404) must return an error when providing a "password" that mismatches user\'s password', async t => {
  await t.context.model.create(VALID_DOC);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  return got.post(URL, {
    json: { email: VALID_DOC.email, password: `not-${VALID_DOC.password}` },
    headers
  })
  .catch(error => {
    t.assert(error.response.statusCode == 404);
    t.deepEqual(JSON.parse(error.response.body), translate.error(AUTHENTICATION_ERROR_PASSWORD_MISMATCH, LOCALE, {}));
  });
});
