import test from 'ava';
import got from 'got';
import server from '@leonardosarmentocastro/server';
import i18n from '@leonardosarmentocastro/i18n';
import { database } from '@leonardosarmentocastro/database';
import { translate } from '@leonardosarmentocastro/i18n';
import { isRequiredValidator } from '@leonardosarmentocastro/validate';

import {
  SMS_2FA_VERIFICATION_REQUEST_ID_MOCK,
  SMS_2FA_VERIFICATION_PIN_MOCK,
} from '../../__mocks__/sms.mock.js';
import { connect } from '../../connect.js';
import { TestingModel } from '../../../defaults.js';

// Setup
const PORT = 8080;
const LOCALE = 'pt-br';
const URL = `http://127.0.0.1:${PORT}/authentication/2FA/check`;
const headers = { 'accept-language': LOCALE };
test.before('set required environment variables', t => {
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY = 'api key'; // necessary in real world usage, but not in tests
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET = 'api secret'; // necessary in real world usage, but not in tests
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
  const response = await got.post(URL, {
    headers,
    json: {
      requestId: SMS_2FA_VERIFICATION_REQUEST_ID_MOCK,
      pin: SMS_2FA_VERIFICATION_PIN_MOCK,
    },
  });

  t.assert(response.statusCode == 200);
});

['requestId', 'pin'].map(field =>
  test(`(400) must return an error when required body attribute "${field}" is missing`, t => {
    const payload = {
      requestId: SMS_2FA_VERIFICATION_REQUEST_ID_MOCK,
      pin: SMS_2FA_VERIFICATION_PIN_MOCK,
      [field]: undefined,
    };

    return got.post(URL, { headers, json: payload })
      .catch(error => {
        const { validator, ...err } = isRequiredValidator(field)(payload);

        t.assert(error.response.statusCode == 400);
        t.deepEqual(JSON.parse(error.response.body), translate.error(err, LOCALE, {}));
      });
  })
);
