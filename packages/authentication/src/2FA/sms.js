import got from 'got';
// import { Vonage } from '@vonage/server-sdk';

import {
  sms2FACancelUnexpectedError,
  sms2FACheckUnexpectedError,
  sms2FAVerificationUnexpectedError,
} from './errors.js';

// const vonage = () => new Vonage({
//   apiKey: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
//   apiSecret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
// });

const BASE_URL = 'https://api.nexmo.com/verify';
const FORMAT = 'json';
const vonage = {
  verify: {
    cancel: async (requestId) => {
      const response = await got.post(`${BASE_URL}/control/${FORMAT}`, {
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
        ...rest
      } = response.body;
      if (Number(status) !== 0) throw sms2FACancelUnexpectedError({
        requestId,
        stacktrace: { command, errorText, requestId, status },
      });

      return { command, status };
    },
    check: async (requestId, pin) => {
      const response = await got.post(`${BASE_URL}/check/${FORMAT}`, {
        json: {
          api_key: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
          api_secret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
          code: pin,
          request_id: requestId,
        },
      });

      const {
        error_text: errorText,
        request_id: requestId,
        status,
        ...rest
      } = response.body;
      if (Number(status) !== 0) throw sms2FACheckUnexpectedError({
        pid,
        requestId,
        stacktrace: { errorText, requestId, status },
      });

      return { requestId, status, ...rest };
    },
    start: async (cellphoneNumber) => {
      const country = 'BR';
      const language = 'pt-br';
      const response = await got.post(`${BASE_URL}/${FORMAT}`, {
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
      } = response.body;
      if (Number(status) !== 0) throw sms2FAVerificationUnexpectedError({
        cellphoneNumber,
        stacktrace: { errorText, status },
      });

      return requestId;
    },
  },
};

export const $sms = ({ __vonage__ = vonage }) => ({
  cancel: async (requestId) => {
    try {
      const response = await __vonage__.verify.cancel(requestId);
      console.debug('[authentication::sms] cancel', response);

      return response;
    } catch(err) {
      throw sms2FACancelUnexpectedError({ requestId, stacktrace: err });
    }
  },
  check: async (requestId, pin) => {
    try {
      const response = await __vonage__.verify.check(requestId, pin);
      console.debug('[authentication::sms] check', response);

      return response;
    } catch(err) {
      throw sms2FACheckUnexpectedError({ pid, requestId, stacktrace: err });
    }
  },
  verify: async (cellphoneNumber) => {
    try {
      console.log('[2FA::SMS] process.env', process.env);
      console.debug('[2FA::SMS] __vonage__', __vonage__);
      // const { request_id: requestId } = await __vonage__.verify.start({
      //   number: cellphoneNumber,
      //   brand: process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME,
      // });
      const requestId = await __vonage__.verify.start(cellphoneNumber);
      console.debug('[2FA::SMS] verify', requestId);

      return requestId;
    } catch(err) {
      console.log('@@@ err', err)
      throw sms2FAVerificationUnexpectedError({ cellphoneNumber, stacktrace: err });
    }
  },
});

export const sms = $sms({});
