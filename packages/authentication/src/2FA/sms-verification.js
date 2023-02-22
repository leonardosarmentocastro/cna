import got from 'got';

import {
  sms2FACancelUnexpectedError,
  sms2FACheckUnexpectedError,
  sms2FAVerificationUnexpectedError,
} from './errors.js';

const FORMAT = 'json';
export const SMS_2FA_BASE_URL = 'https://api.nexmo.com/verify';

export const SMS_START_2FA_VERIFICATION_PATH = `/${FORMAT}`;
export const SMS_CHECK_2FA_VERIFICATION_PATH = `/check/${FORMAT}`;
export const SMS_CANCEL_2FA_VERIFICATION_PATH = `/control/${FORMAT}`;

export const SMS_START_2FA_VERIFICATION_URL = `${SMS_2FA_BASE_URL}/${FORMAT}`;
export const SMS_CHECK_2FA_VERIFICATION_URL = `${SMS_2FA_BASE_URL}/check/${FORMAT}`;
export const SMS_CANCEL_2FA_VERIFICATION_URL = `${SMS_2FA_BASE_URL}/control/${FORMAT}`;

export const smsVerification = {
  cancel: async (requestId) => {
    const response = await got.post(SMS_CANCEL_2FA_VERIFICATION_URL, {
      json: {
        api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
        api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
        request_id: requestId,
        cmd: 'cancel',
      },
    });

    const {
      command,
      error_text: errorText,
      status,
    } = JSON.parse(response.body);
    if (Number(status) !== 0) throw {
      err: sms2FACancelUnexpectedError({
        requestId,
        errorText,
        status,
      }),
      statusCode: 500,
    };

    return { command, status };
  },
  check: async (requestId, pin) => {
    const response = await got.post(SMS_CHECK_2FA_VERIFICATION_URL, {
      json: {
        api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
        api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
        code: pin,
        request_id: requestId,
      },
    });

    const {
      error_text: errorText,
      status,
      ...rest
    } = JSON.parse(response.body);
    if (Number(status) !== 0) throw {
      err: sms2FACheckUnexpectedError({
        errorText,
        pin,
        requestId,
        status,
      }),
      statusCode: 500,
    };

    return { requestId, status, ...rest };
  },
  // TODO: https://api.nexmo.com/verify/search
  // search:
  start: async (cellphoneNumber) => {
    const country = 'BR';
    const language = 'pt-br';
    const response = await got.post(SMS_START_2FA_VERIFICATION_URL, {
      json: {
        country,
        api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
        api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
        brand: process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME,
        code_length: 4,
        lg: language,
        number: cellphoneNumber,
      },
    });

    const {
      error_text: errorText,
      request_id: requestId,
      status,
    } = JSON.parse(response.body);
    if (Number(status) !== 0) throw {
      err: sms2FAVerificationUnexpectedError({
        cellphoneNumber,
        errorText,
        requestId, // can be returned if status === '10'
        status,
      }),
      statusCode: 500,
    };

    return requestId;
  },
};
