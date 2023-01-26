import jwt from 'jsonwebtoken';
import util from 'util';

// TODO: provide a way to register using email
// import { VALID_USE_CHOICES } from './constants';

const verify = util.promisify(jwt.verify);

export const isValidCellphoneValidator = (doc) => ({
  code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE',
  field: 'cellphone',
  value: doc.cellphone,
  validator: () => {
    // ^[\+]?[0-9]{2}[(]?[0-9]{2}[)]?[-\s\.]?[0-9]{5}[-\s\.]?[0-9]{4}$
    const regex = /^[\+][0-9]{2}[\s]?[0-9]{2}[\s]?[\s]?[0-9]{5}[\s]?[0-9]{4}$/;
    const isValid = regex.test(doc.cellphone);

    return isValid;
  },
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
