import { $sms } from '../sms.js';

export const SMS_2FA_VERIFICATION_CELLPHONE_NUMBER_MOCK = '+5511000001111';
export const SMS_2FA_VERIFICATION_SENDER_NAME_MOCK = 'SENDER NAME';
export const SMS_2FA_VERIFICATION_REQUEST_ID_MOCK = 'REQUEST_001';
export const SMS_2FA_VERIFICATION_PIN_MOCK = 'PIN_00001';

const VONAGE_MOCK = {
  verify: {
    cancel: async (requestId) => {
      console.debug('[MOCK] __vonage__.cancel', requestId);
      const isTestingRequestId = (requestId === SMS_2FA_VERIFICATION_REQUEST_ID_MOCK);
      if (!isTestingRequestId) return Promise.reject({ err: 'Something went wrong' });

      return Promise.resolve();
    },
    check: async (requestId, pin) => {
      console.debug('[MOCK] __vonage__.check', requestId, pin);
      const isTestingRequestId = (requestId === SMS_2FA_VERIFICATION_REQUEST_ID_MOCK);
      const isTestingPIN = (pin === SMS_2FA_VERIFICATION_PIN_MOCK);

      if (!isTestingRequestId && !isTestingPIN) return Promise.reject({ err: 'Something went wrong' });
      return Promise.resolve();
    },
    start: async ({ number, brand }) => {
      console.debug('[MOCK] __vonage__.start', number, brand);
      const requestId = SMS_2FA_VERIFICATION_REQUEST_ID_MOCK;
      const isTestingCellphoneNumber = (number === SMS_2FA_VERIFICATION_CELLPHONE_NUMBER_MOCK);
      const isTestingSender = (brand === SMS_2FA_VERIFICATION_SENDER_NAME_MOCK);

      if (!isTestingCellphoneNumber && !isTestingSender) Promise.reject({ err: 'Something went wrong' });
      return Promise.resolve({ request_id: requestId });
    },
  },
};

export const SMS_2FA_MOCK = $sms({ __vonage__: VONAGE_MOCK });
