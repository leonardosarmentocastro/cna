import jwt from 'jsonwebtoken';
import util from 'util';

// TODO: provide a way to register using email
// import { VALID_USE_CHOICES } from './constants';

const verify = util.promisify(jwt.verify);

// ^[\+]?[0-9]{2}[(]?[0-9]{2}[)]?[-\s\.]?[0-9]{5}[-\s\.]?[0-9]{4}$
// ^[0-9]{2}[\s]?[0-9]{2}[\s]?[\s]?[0-9]{5}[\s]?[0-9]{4}$
export const CELLPHONE_NUMBER_VALIDATION_REGEX = /^[0-9]{2}[0-9]{2}[0-9]{5}[0-9]{4}$/;
export const isValidCellphoneNumberValidator = (doc) => ({
  code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE_NUMBER',
  field: 'cellphoneNumber',
  value: doc.cellphoneNumber,
  validator: () => {
    const regex = CELLPHONE_NUMBER_VALIDATION_REGEX;
    const isValid = regex.test(doc.cellphoneNumber);

    return isValid;
  },
  CELLPHONE_NUMBER_VALIDATION_REGEX: CELLPHONE_NUMBER_VALIDATION_REGEX.toString(),
});

// TODO: provide a way to register using email
// export const isValidUseChoiceValidator = (doc = {}) => ({
//   code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_USE_CHOICE',
//   field: 'use',
//   value: doc.use,
//   validator: () => {
//     const isValid = VALID_USE_CHOICES.some(use => use === doc.use);
//     return isValid;
//   },
//   VALID_USE_CHOICES,
// });

export const areValidTokensValidator = (doc) => ({
  code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_TOKENS',
  field: 'tokens',
  validator: async () => {
    if (doc.tokens.length === 0) return true;

    const verifications = doc.tokens.map(token => verify(token, process.env.AUTHENTICATION_SECRET));
    const results = (await Promise.allSettled(verifications));
    const areValid = results.every(result => result.status === 'fulfilled');

    return areValid;
  },
});
