import test from 'ava';
import { translate, $translations } from '@leonardosarmentocastro/i18n';

import {
  isCellphoneNumberAlreadyInUseValidator,
  isValidCellphoneNumberValidator,
  CELLPHONE_NUMBER_VALIDATION_REGEX,
} from '../../validators.js';

const translations = $translations();
const availableLanguages = translations.getAvailableLanguages();

availableLanguages.map(language => {
  test(`(isValidCellphoneNumberValidator) translation for validator must be set on translation files for language "${language}"`, t => {
    const doc = { cellphoneNumber: 'invalid cellphone number 123-123-123' };
    const { validator, ...err } = isValidCellphoneNumberValidator(doc);
    const translation = translate.error(err, language, doc);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE_NUMBER',
      field: 'cellphoneNumber',
      value: doc.cellphoneNumber,
      message: translate.get('AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE_NUMBER', language, { ...doc, ...err }),
      CELLPHONE_NUMBER_VALIDATION_REGEX: CELLPHONE_NUMBER_VALIDATION_REGEX.toString(),
    });
  });

  test(`(isCellphoneNumberAlreadyInUseValidator) translation for validator must be set on translation files for language "${language}"`, t => {
    const doc = {
      authentication: { cellphoneNumber: '123-123-123' },
    };
    const { validator, ...err } = isCellphoneNumberAlreadyInUseValidator(doc);
    const translation = translate.error(err, language, doc);

    t.deepEqual(translation, {
      code: 'AUTHENTICATION_VALIDATOR_ERROR_CELLPHONE_NUMBER_ALREADY_IN_USE',
      field: 'authentication.cellphoneNumber',
      message: translate.get('AUTHENTICATION_VALIDATOR_ERROR_CELLPHONE_NUMBER_ALREADY_IN_USE', language, { ...doc, ...err }),
    });
  });
});
