import test from 'ava';
import got from 'got';
import jwt from 'jsonwebtoken';
import i18n from '@leonardosarmentocastro/i18n';
import server from '@leonardosarmentocastro/server';
import { database } from '@leonardosarmentocastro/database';
import { translate } from '@leonardosarmentocastro/i18n';
import { isRequiredValidator } from '@leonardosarmentocastro/validate';

import {
  authenticationErrorCellphoneNumberNotFound,
  authenticationErrorPasswordMismatch,
} from '../../../errors.js';
import { DEFAULTS } from '../../../defaults.js';
import { connect } from '../../../connect.js';
import { VALID_DOC } from '../../../__fixtures__/index.js';

// Setup
const PORT = 8080;
const URL = `http://127.0.0.1:${PORT}/authentication/sign-in`;
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

  const response = await got.post(URL, {
    json: {
      cellphoneNumber: VALID_DOC.authentication.cellphoneNumber,
      password: VALID_DOC.authentication.password,
    },
    headers,
  });

  t.assert(response.statusCode == 200);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const [ type, authenticationToken ] = response.headers.authorization.trim().split(' ');
  t.assert(type === 'Bearer');
  t.truthy(authenticationToken);
  t.notThrows(() => jwt.verify(authenticationToken, process.env.AUTHENTICATION_SECRET));
});

// Unhappy path tests
[ 'cellphoneNumber', 'password' ].forEach(field => {
  test(`(400) must return an error when not providing the field "${field}" on request body`, t => {
    const { cellphoneNumber, password } = VALID_DOC.authentication;
    const authenticationPayload = { cellphoneNumber, password, [field]: undefined };

    return got.post(URL, { json: authenticationPayload, headers })
      .catch(error => {
        const { validator, ...err } = isRequiredValidator(field)(authenticationPayload);

        t.assert(error.response.statusCode == 400);
        t.deepEqual(JSON.parse(error.response.body), translate.error(err, LOCALE, {}));
      });
  });
});

test('(404) must return an error when providing an "cellphoneNumber" that is not registered for any user', t => {
  const cellphoneNumber = `not-${VALID_DOC.authentication.cellphoneNumber}`;
  const { password } = VALID_DOC.authentication;

  return got.post(URL, {
    json: { cellphoneNumber, password },
    headers
  })
  .catch(error => {
    t.assert(error.response.statusCode == 404);
    t.deepEqual(JSON.parse(error.response.body), translate.error(authenticationErrorCellphoneNumberNotFound(cellphoneNumber), LOCALE, {}));
  });
});

test('(404) must return an error when providing a "password" that mismatches user\'s password', async t => {
  await t.context.model.create(VALID_DOC);
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const cellphoneNumber = VALID_DOC.authentication.cellphoneNumber;
  const password = `not-${VALID_DOC.authentication.password}`;

  return got.post(URL, {
    json: { cellphoneNumber, password },
    headers
  })
  .catch(error => {
    t.assert(error.response.statusCode == 404);
    t.deepEqual(JSON.parse(error.response.body), translate.error(authenticationErrorPasswordMismatch(password), LOCALE, {}));
  });
});
