import test from 'ava';
import { translate, $translations } from '@leonardosarmentocastro/i18n';

import {
  areValidTokensValidator,
  isValidCellphoneNumberValidator,
} from '../../validators.js';

const translations = $translations();
const availableLanguages = translations.getAvailableLanguages();

availableLanguages.map(language => {
  test(`(areValidTokensValidator) translation for validator must be set on translation files for language "${language}"`, t => {
    const doc = { tokens: [] };
    const { validator, ...err } = areValidTokensValidator(doc);
    const translation = translate.error(err, language, doc);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_TOKENS',
      field: 'tokens',
      message: translate.get('AUTHENTICATION_VALIDATOR_ERROR_INVALID_TOKENS', language, { ...doc, ...err }),
    });
  });

  test(`(isValidCellphoneNumberValidator) translation for validator must be set on translation files for language "${language}"`, t => {
    const doc = { cellphoneNumber: 'invalid cellphone number 123-123-123' };
    const { validator, ...err } = isValidCellphoneNumberValidator(doc);
    const translation = translate.error(err, language, doc);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE_NUMBER',
      field: 'cellphoneNumber',
      value: doc.cellphoneNumber,
      message: translate.get('AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE_NUMBER', language, { ...doc, ...err }),
    });
  });
});
