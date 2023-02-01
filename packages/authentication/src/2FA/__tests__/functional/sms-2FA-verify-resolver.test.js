import test from 'ava';
import got from 'got';
import server from '@leonardosarmentocastro/server';
import i18n from '@leonardosarmentocastro/i18n';
import { database } from '@leonardosarmentocastro/database';
import { translate } from '@leonardosarmentocastro/i18n';
import { isRequiredValidator } from '@leonardosarmentocastro/validate';

import {
  SMS_2FA_VERIFICATION_REQUEST_ID_MOCK,
  SMS_2FA_VERIFICATION_CELLPHONE_NUMBER_MOCK,
  SMS_2FA_VERIFICATION_SENDER_NAME_MOCK,
} from '../../__mocks__/sms.mock.js';
import { connect } from '../../connect.js';
import { VALID_DOC } from '../../../__fixtures__/index.js';
import { TestingModel } from '../../../defaults.js';
import { sms2FAErrorCellphoneNumberAlreadyRegistered } from '../../errors.js';

// Setup
const PORT = 8080;
const LOCALE = 'pt-br';
const URL = `http://127.0.0.1:${PORT}/authentication/2FA/verify`;
const headers = { 'accept-language': LOCALE };
test.before('set required environment variables', t => {
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY = 'api key'; // necessary in real world usage, but not in tests
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET = 'api secret'; // necessary in real world usage, but not in tests
  process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME = SMS_2FA_VERIFICATION_SENDER_NAME_MOCK; // necessary in real world usage, but not in tests
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
test('(200) must succeed on request cellphone number verification and return a request id for future check', async t => {
  const response = await got.post(URL, {
    headers,
    json: { cellphoneNumber: SMS_2FA_VERIFICATION_CELLPHONE_NUMBER_MOCK },
  });

  t.assert(response.statusCode == 200);
  t.deepEqual(JSON.parse(response.body), { requestId: SMS_2FA_VERIFICATION_REQUEST_ID_MOCK });
});

test('(400) must return an error when required body attribute "cellphoneNumber" is missing', t => {
  const payload = { cellphoneNumber: undefined };

  return got.post(URL, { headers, json: payload })
    .catch(error => {
      const { validator, ...err } = isRequiredValidator('cellphoneNumber')(payload);

      t.assert(error.response.statusCode == 400);
      t.deepEqual(JSON.parse(error.response.body), translate.error(err, LOCALE, {}));
    });
});

test('(400) must return an error when user is attempting to request a verification using a cellphone number that is already used by a registered user', async t => {
  t.assert((await getDocsSavedOnDatabase(t)).length === 0);
  const registeredUser = await new t.context.model(VALID_DOC).save();
  t.assert((await getDocsSavedOnDatabase(t)).length === 1);

  const cellphoneNumber = registeredUser.authentication.cellphoneNumber;
  await got.post(URL, { headers, json: { cellphoneNumber } })
    .catch(error => {
      t.assert(error.response.statusCode == 409);
      t.deepEqual(
        JSON.parse(error.response.body),
        translate.error(sms2FAErrorCellphoneNumberAlreadyRegistered(cellphoneNumber), LOCALE, {})
      );
    });
});
