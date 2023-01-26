import test from 'ava';
import { translate, $translations } from '@leonardosarmentocastro/i18n';

import {
  areValidTokensValidator,
  isValidCellphoneValidator,
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

  test(`(isValidCellphoneValidator) translation for validator must be set on translation files for language "${language}"`, t => {
    const doc = { cellphone: 'invalid cellphone 123-123-123' };
    const { validator, ...err } = isValidCellphoneValidator(doc);
    const translation = translate.error(err, language, doc);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE',
      field: 'cellphone',
      value: doc.cellphone,
      message: translate.get('AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE', language, { ...doc, ...err }),
    });
  });
});
