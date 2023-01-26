import test from 'ava';
import { translate, $translations } from '@leonardosarmentocastro/i18n';

import {
  authenticationErrorCellphoneNotFound,
  authenticationErrorPasswordMismatch,
} from '../../errors.js';

const translations = $translations();
const availableLanguages = translations.getAvailableLanguages();

availableLanguages.map(language => {
  test(`(authenticationErrorCellphoneNotFound) translation for error must be set on translation files for language "${language}"`, t => {
    const cellphone = '5512000001111';
    const err = authenticationErrorCellphoneNotFound(cellphone);
    const translation = translate.error(err, language, cellphone);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_ERROR_CELLPHONE_NOT_FOUND',
      field: 'cellphone',
      value: cellphone,
      message: translate.get('AUTHENTICATION_ERROR_CELLPHONE_NOT_FOUND', language, err),
    });
  });

  test(`(authenticationErrorPasswordMismatch) translation for error must be set on translation files for language "${language}"`, t => {
    const password = 'password123456';
    const err = authenticationErrorPasswordMismatch(password);
    const translation = translate.error(err, language, password);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_ERROR_PASSWORD_MISMATCH',
      field: 'password',
      value: password,
      message: translate.get('AUTHENTICATION_ERROR_PASSWORD_MISMATCH', language, err),
    });
  });
});
