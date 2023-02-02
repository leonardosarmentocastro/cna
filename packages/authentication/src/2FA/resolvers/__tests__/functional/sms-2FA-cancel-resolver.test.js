import test from 'ava';
import got from 'got';
import nock from 'nock';
import server from '@leonardosarmentocastro/server';
import i18n from '@leonardosarmentocastro/i18n';
import { database } from '@leonardosarmentocastro/database';
import { translate } from '@leonardosarmentocastro/i18n';
import { isRequiredValidator } from '@leonardosarmentocastro/validate';

import { connect } from '../../../connect.js';
import { TestingModel } from '../../../../defaults.js';
import {
  SMS_2FA_BASE_URL,
  SMS_CANCEL_2FA_VERIFICATION_PATH,
} from '../../../sms-verification.js';
import { sms2FACancelUnexpectedError } from '../../../errors.js';

// Setup
const PORT = 8080;
const LOCALE = 'pt-br';
const URL = `http://127.0.0.1:${PORT}/authentication/2FA/cancel`;
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
test('(200) must succeed on checking a sms verification request', async t => {
  const requestId = 'abcdef0123456789abcdef0123456789';
  const command = 'cancel';

  const payload = {
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    request_id: requestId,
    cmd: command,
  };
  const response1 = { command, status: "0" };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_CANCEL_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response1);

  const response2 = await got.post(URL, {
    headers,
    json: { requestId },
  });
  t.assert(response2.statusCode == 200);
});

['requestId'].map(field =>
  test(`(400) must return an error when required body attribute "${field}" is missing`, t => {
    const requestId = 'abcdef0123456789abcdef0123456789';
    const payload = { requestId, [field]: undefined };

    return got.post(URL, { headers, json: payload })
      .catch(error => {
        const { validator, ...err } = isRequiredValidator(field)(payload);

        t.assert(error.response.statusCode == 400);
        t.deepEqual(JSON.parse(error.response.body), translate.error(err, LOCALE, {}));
      });
  })
);

test('(400) must return an error with detailed information in case anything goes wrong with the sms verification check', async t => {
  const requestId = 'abcdef0123456789abcdef0123456789';
  const command = 'cancel';
  const error = { code: '5', error_text: 'Internal Error' };

  const payload = {
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    request_id: requestId,
    cmd: command,
  };
  const response = { status: error.code, error_text: error.error_text };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_CANCEL_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response);

  let failed = false;
  try {
    await got.post(URL, {
      headers,
      json: { requestId },
    });
  } catch(err) {
    failed = true;

    t.assert(err.response.statusCode == 500);
    t.deepEqual(
      JSON.parse(err.response.body),
      translate.error(sms2FACancelUnexpectedError({
        requestId,
        errorText: error.error_text,
        status: error.code,
      }), LOCALE, {})
    );
  }

  t.truthy(failed);
});
