import test from 'ava';
import { translate, $translations } from '@leonardosarmentocastro/i18n';

import {
  authenticationErrorCellphoneNumberNotFound,
  authenticationErrorPasswordMismatch,
} from '../../errors.js';

const translations = $translations();
const availableLanguages = translations.getAvailableLanguages();

availableLanguages.map(language => {
  test(`(authenticationErrorCellphoneNumberNotFound) translation for error must be set on translation files for language "${language}"`, t => {
    const cellphoneNumber = '5512000001111';
    const err = authenticationErrorCellphoneNumberNotFound(cellphoneNumber);
    const translation = translate.error(err, language, cellphoneNumber);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_ERROR_CELLPHONE_NUMBER_NOT_FOUND',
      field: 'cellphoneNumber',
      value: cellphoneNumber,
      message: translate.get('AUTHENTICATION_ERROR_CELLPHONE_NUMBER_NOT_FOUND', language, err),
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
