import test from 'ava';
import nock from 'nock';

import {
  sms2FAVerificationUnexpectedError,
  sms2FACancelUnexpectedError,
  sms2FACheckUnexpectedError,
} from '../../errors.js';
import {
  smsVerification,
  SMS_2FA_BASE_URL,
  SMS_CANCEL_2FA_VERIFICATION_PATH,
  SMS_CHECK_2FA_VERIFICATION_PATH,
  SMS_START_2FA_VERIFICATION_PATH,
} from '../../sms-verification.js';
import { VALID_DOC } from '../../../__fixtures__/doc.fixture.js';

test.before('set required environment variables', () => {
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY = 'vonage api key';
  process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET = 'vonage api secret';
  process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME = 'sms sender name';
});
test.afterEach('clean all network interceptors', () => nock.cleanAll());

test('(start) must be successful on triggering a SMS send, and return a "requestId" for future verification check', async t => {
  const { cellphoneNumber } = VALID_DOC.authentication;

  const payload = {
    country: 'BR',
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    brand: process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME,
    code_length: 4,
    lg: 'pt-br',
    number: cellphoneNumber,
  };
  const response = { status: '0', request_id: 'abcdef0123456789abcdef0123456789' };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_START_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response);

  const requestId = await smsVerification.start(cellphoneNumber);
  t.assert(requestId === response.request_id);
});

test('(start) in case it fails, it must throw an error containing more detailed information', async t => {
  const { cellphoneNumber } = VALID_DOC.authentication;
  const POSSIBLE_ERRORS = [{
    code: '1',
    error_text: 'Throttled',
  }, {
    code: '2',
    error_text: 'Your request is incomplete and missing the mandatory parameter $parameter',
  }, {
    code: '3',
    error_text: 'Invalid value for parameter $parameter',
  }, {
    code: '4',
    error_text: 'Invalid credentials were provided',
  }, {
    code: '5',
    error_text: 'Internal Error',
  }, {
    code: '6',
    error_text: 'The Vonage platform was unable to process this message for the following reason: $reason',
  }, {
    code: '7',
    error_text: 'The number you are trying to verify is blacklisted for verification.',
  }, {
    code: '8',
    error_text: 'The api_key you supplied is for an account that has been barred from submitting messages.',
  }, {
    code: '9',
    error_text: 'Partner quota exceeded',
  }, {
    code: '10',
    error_text: 'Concurrent verifications to the same number are not allowed.',
  }, {
    code: '15',
    error_text: 'The destination number is not in a supported network',
  }, {
    code: '20',
    error_text: 'This account does not support the parameter: pin_code.',
  }, {
    code: '29',
    error_text: 'Non-Permitted Destination',
  }];
  const randomError = POSSIBLE_ERRORS[Math.floor(Math.random() * POSSIBLE_ERRORS.length)];

  const payload = {
    country: 'BR',
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    brand: process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME,
    code_length: 4,
    lg: 'pt-br',
    number: cellphoneNumber,
  };
  const response = {
    status: randomError.code,
    error_text: randomError.error_text,
    network: '244523',
    request_id: ''
  };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_START_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response);

  let failed = false;
  try {
    await smsVerification.start(cellphoneNumber);
  } catch(err) {
    failed = true;

    t.deepEqual(err, {
      err: sms2FAVerificationUnexpectedError({
        cellphoneNumber,
        errorText: randomError.error_text,
        status: randomError.code,
      }),
      statusCode: 500,
    });
  }

  t.truthy(failed);
});

test('(check) must be successful on checking a SMS verification against an user served "requestId" and "pin"', async t => {
  const pin = '0123';
  const requestId = 'abcdef0123456789abcdef0123456789';

  const payload = {
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    code: pin,
    request_id: requestId,
  };
  const response1 = {
    request_id: requestId,
    event_id: "0A00000012345678",
    status: "0",
    price: "0.10000000",
    currency: "EUR",
    estimated_price_messages_sent: "0.03330000"
  };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_CHECK_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response1);

  const response2 = await smsVerification.check(requestId, pin);
  t.deepEqual(response2, { requestId, ...response1 });
});

test('(check) in case it fails, it must throw an error containing more detailed information', async t => {
  const pin = '0123';
  const requestId = 'abcdef0123456789abcdef0123456789';
  const POSSIBLE_ERRORS = [{
    code: '1',
    error_text: 'Throttled',
  }, {
    code: '2',
    error_text: 'Your request is incomplete and missing the mandatory parameter $parameter',
  }, {
    code: '3',
    error_text: 'Invalid value for parameter $parameter',
  }, {
    code: '4',
    error_text: 'Invalid credentials were provided',
  }, {
    code: '5',
    error_text: 'Internal Error',
  }, {
    code: '6',
    error_text: 'The Vonage platform was unable to process this message for the following reason: $reason',
  }, {
    code: '16',
    error_text: 'The code inserted does not match the expected value',
  }, {
    code: '17',
    error_text: 'The wrong code was provided too many times',
  }];
  const randomError = POSSIBLE_ERRORS[Math.floor(Math.random() * POSSIBLE_ERRORS.length)];

  const payload = {
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    code: pin,
    request_id: requestId,
  };
  const response = {
    request_id: requestId,
    status: randomError.code,
    error_text: randomError.error_text,
  };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_CHECK_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response);

  let failed = false;
  try {
    await smsVerification.check(requestId, pin);
  } catch(err) {
    failed = true;

    t.deepEqual(err, {
      err: sms2FACheckUnexpectedError({
        requestId,
        pin,
        errorText: randomError.error_text,
        status: randomError.code,
      }),
      statusCode: 500,
    });
  }

  t.truthy(failed);
});

test('(cancel) must be successful on canceling a SMS verification against an user served "requestId"', async t => {
  const requestId = 'abcdef0123456789abcdef0123456789';
  const command = 'cancel';

  const payload = {
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    request_id: requestId,
    cmd: command,
  };
  const response = { command, status: "0" };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_CANCEL_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response);

  const response2 = await smsVerification.cancel(requestId);
  t.deepEqual(response2, { status: '0', command });
});

test('(cancel) in case it fails, it must throw an error containing more detailed information', async t => {
  const requestId = 'abcdef0123456789abcdef0123456789';
  const command = 'cancel';
  const POSSIBLE_ERRORS = [{
    code: '1',
    error_text: 'Throttled',
  }, {
    code: '2',
    error_text: 'Your request is incomplete and missing the mandatory parameter $parameter',
  }, {
    code: '3',
    error_text: 'Invalid value for parameter $parameter',
  }, {
    code: '4',
    error_text: 'Invalid credentials were provided',
  }, {
    code: '5',
    error_text: 'Internal Error',
  }, {
    code: '6',
    error_text: 'The Vonage platform was unable to process this message for the following reason: $reason',
  }, {
    code: '8',
    error_text: 'The api_key you supplied is for an account that has been barred from submitting messages.',
  }, {
    code: '9',
    error_text: 'Partner quota exceeded',
  }, {
    code: '19',
    error_text: 'For cancel: Either you have not waited at least 30 secs after sending a Verify request before cancelling or Verify has made too many attempts to deliver the verification code for this request and you must now wait for the process to complete. For trigger_next_event: All attempts to deliver the verification code for this request have completed and there are no remaining events to advance to.',
  }];
  const randomError = POSSIBLE_ERRORS[Math.floor(Math.random() * POSSIBLE_ERRORS.length)];

  const payload = {
    api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
    api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
    request_id: requestId,
    cmd: command,
  };
  const response = { status: randomError.code, error_text: randomError.error_text };
  nock(SMS_2FA_BASE_URL)
    .post(SMS_CANCEL_2FA_VERIFICATION_PATH, (body) => JSON.stringify(payload) === JSON.stringify(body))
    .reply(200, response);

  let failed = false;
  try {
    await smsVerification.cancel(requestId);
  } catch(err) {
    failed = true;

    t.deepEqual(err, {
      err: sms2FACancelUnexpectedError({
        requestId,
        errorText: randomError.error_text,
        status: randomError.code,
      }),
      statusCode: 500,
    });
  }

  t.truthy(failed);
});
