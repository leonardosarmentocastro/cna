// import jwt from 'jsonwebtoken';
// import util from 'util';

import { isEmpty } from './utils.js';

// const verify = util.promisify(jwt.verify);

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

// TODO: provide a test for this.
export const isCellphoneNumberAlreadyInUseValidator = (doc = {}) => ({
  code: 'AUTHENTICATION_VALIDATOR_ERROR_CELLPHONE_NUMBER_ALREADY_IN_USE',
  field: 'authentication.cellphoneNumber',
  validator: async () => {
    const model = doc.constructor;
    const cellphoneNumbers = await model.aggregate().project({ cellphoneNumber: '$authentication.cellphoneNumber' });
    const found = cellphoneNumbers.find(({ cellphoneNumber }) => cellphoneNumber === doc?.authentication?.cellphoneNumber);

    const notBeingUsed = isEmpty(found);
    const isUsedByMe = (found?._id.toString() === doc.id);
    const isValid = notBeingUsed || isUsedByMe;

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
