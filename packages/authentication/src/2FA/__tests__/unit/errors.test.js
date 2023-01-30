import test from 'ava';
import { translate, $translations } from '@leonardosarmentocastro/i18n';

import {
  sms2FACancelUnexpectedError,
  sms2FACheckUnexpectedError,
  sms2FAErrorCellphoneNumberAlreadyRegistered,
  sms2FAVerificationUnexpectedError,
} from '../../errors.js';

const translations = $translations();
const availableLanguages = translations.getAvailableLanguages();

availableLanguages.map(language => {
  test(`(sms2FACancelUnexpectedError) translation for error must be set on translation files for language "${language}"`, t => {
    const requestId = '101010';
    const stacktrace = { err: 'something wrong happened' };
    const err = sms2FACancelUnexpectedError({ requestId, stacktrace });
    const translation = translate.error(err, language, {});

    t.deepEqual(translation, {
      requestId,
      stacktrace,
      code: 'AUTHENTICATION_SMS_2FA_CANCEL_UNEXPECTED_ERROR',
      message: translate.get('AUTHENTICATION_SMS_2FA_CANCEL_UNEXPECTED_ERROR', language, err),
    });
  });

  test(`(sms2FACheckUnexpectedError) translation for error must be set on translation files for language "${language}"`, t => {
    const pid = '1234';
    const requestId = '101010';
    const stacktrace = { err: 'something wrong happened' };
    const err = sms2FACheckUnexpectedError({ pid, requestId, stacktrace });
    const translation = translate.error(err, language, {});

    t.deepEqual(translation, {
      pid,
      requestId,
      stacktrace,
      code: 'AUTHENTICATION_SMS_2FA_CHECK_UNEXPECTED_ERROR',
      message: translate.get('AUTHENTICATION_SMS_2FA_CHECK_UNEXPECTED_ERROR', language, err),
    });
  });

  test(`(sms2FAErrorCellphoneNumberAlreadyRegistered) translation for error must be set on translation files for language "${language}"`, t => {
    const cellphoneNumber = '+5512000001111';
    const err = sms2FAErrorCellphoneNumberAlreadyRegistered(cellphoneNumber);
    const translation = translate.error(err, language, {});

    t.deepEqual(translation, {
      cellphoneNumber,
      code: 'AUTHENTICATION_SMS_2FA_CELLPHONE_NUMBER_ALREADY_REGISTERED',
      message: translate.get('AUTHENTICATION_SMS_2FA_CELLPHONE_NUMBER_ALREADY_REGISTERED', language, err),
    });
  });

  test(`(sms2FAVerificationUnexpectedError) translation for error must be set on translation files for language "${language}"`, t => {
    const cellphoneNumber = '+5512000001111';
    const stacktrace = { err: 'something weird happened' };
    const err = sms2FAVerificationUnexpectedError({ cellphoneNumber, stacktrace });
    const translation = translate.error(err, language, {});

    t.deepEqual(translation, {
      cellphoneNumber,
      stacktrace,
      code: 'AUTHENTICATION_SMS_2FA_VERIFICATION_UNEXPECTED_ERROR',
      message: translate.get('AUTHENTICATION_SMS_2FA_VERIFICATION_UNEXPECTED_ERROR', language, err),
    });
  });
});
