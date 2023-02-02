import test from 'ava';
import got from 'got';
import nock from 'nock';
import server from '@leonardosarmentocastro/server';
import i18n from '@leonardosarmentocastro/i18n';
import { database } from '@leonardosarmentocastro/database';
import { translate } from '@leonardosarmentocastro/i18n';
import { isRequiredValidator } from '@leonardosarmentocastro/validate';

import { connect } from '../../../connect.js';
import { VALID_DOC } from '../../../../__fixtures__/index.js';
import { TestingModel } from '../../../../defaults.js';
import { sms2FAErrorCellphoneNumberAlreadyRegistered, sms2FAVerificationUnexpectedError } from '../../../errors.js';
import { isValidCellphoneNumberValidator } from '../../../../validators.js';
import {
  SMS_2FA_BASE_URL,
  SMS_START_2FA_VERIFICATION_PATH,
} from '../../../sms-verification.js';

// Setup
const PORT = 8080;
const LOCALE = 'pt-br';
const URL = `http://127.0.0.1:${PORT}/authentication/2FA/verify`;
const headers = { 'accept-language': LOCALE };
test.before('set required environment variables', t => {
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY = 'api key';
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET = 'api secret';
  process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME = 'sms sender name';
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
  const { cellphoneNumber } = VALID_DOC.authentication;
  const requestId = 'abcdef0123456789abcdef0123456789';

  const payload = {
    country: 'BR',
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    brand: process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME,
    code_length: 4,
    lg: 'pt-br',
    number: cellphoneNumber,
  };
  const response1 = { status: '0', request_id: requestId };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_START_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response1);

  const response2 = await got.post(URL, {
    headers,
    json: { cellphoneNumber },
  });

  t.assert(response2.statusCode == 200);
  t.deepEqual(JSON.parse(response2.body), { requestId });
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

test('(400) must return an error when attribute "cellphoneNumber" is invalid', t => {
  const { cellphoneNumber } = VALID_DOC.authentication;
  const payload = { cellphoneNumber: `+${cellphoneNumber}` };

  return got.post(URL, { headers, json: payload })
    .catch(error => {
      const { validator, ...err } = isValidCellphoneNumberValidator(payload);

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

test('(400) must return an error with detailed information in case anything goes wrong with the sms verification', async t => {
  const { cellphoneNumber } = VALID_DOC.authentication;
  const error = { code: '5', error_text: 'Internal Error' };

  const payload = {
    country: 'BR',
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    brand: process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME,
    code_length: 4,
    lg: 'pt-br',
    number: cellphoneNumber,
  };
  const response1 = {
    status: error.code,
    error_text: error.error_text,
    network: '244523',
    request_id: ''
  };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_START_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response1);

  let failed = false;
  try {
    await got.post(URL, {
      headers,
      json: { cellphoneNumber },
    });
  } catch(err) {
    failed = true;

    t.assert(err.response.statusCode == 500);
    t.deepEqual(
      JSON.parse(err.response.body),
      translate.error(sms2FAVerificationUnexpectedError({
        cellphoneNumber,
        errorText: error.error_text,
        status: error.code,
      }), LOCALE, {})
    );
  }

  t.truthy(failed);
});
