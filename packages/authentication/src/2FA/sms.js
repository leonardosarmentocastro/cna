import { Vonage } from '@vonage/server-sdk';

import {
  sms2FACancelUnexpectedError,
  sms2FACheckUnexpectedError,
  sms2FAVerificationUnexpectedError,
} from './errors.js';

const vonage = new Vonage({
  apiKey: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_KEY,
  apiSecret: process.env.AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET,
});

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
      console.debug('[2FA::SMS] __vonage__', __vonage__);
      const { request_id: requestId } = await __vonage__.verify.start({
        number: cellphoneNumber,
        brand: process.env.AUTHENTICATION_SMS_2FA_SENDER_NAME,
      });
      console.debug('[2FA::SMS] verify', requestId);

      return requestId;
    } catch(err) {
      console.log('@@@ err', err)
      throw sms2FAVerificationUnexpectedError({ cellphoneNumber, stacktrace: err });
    }
  },
});

export const sms = $sms({});
