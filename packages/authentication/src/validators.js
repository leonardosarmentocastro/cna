// import jwt from 'jsonwebtoken';
// import util from 'util';

import { get } from './utils.js';

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

export const isCellphoneAlreadyInUseValidator = (doc = {}) => {
  const field = 'authentication.cellphoneNumber';

  return {
    field,
    code: 'AUTHENTICATION_VALIDATOR_ERROR_CELLPHONE_ALREADY_IN_USE',
    validator: async () => {
      const model = doc.constructor;
      const baseModel = Object.keys(model.base.models)[0];
      const value = get(doc, field);
      const records = await model.base.models[baseModel].find({ field: value });

      // NOTE: Both "create" and "update" operations run validations appended to ".save" method.
      // We **must** validate both cases, cause:
      // If you create an user with username "username123" and update any other field later on,
      // the update operation would not be successful due to the username field being used by yourself.
      const isBeingUsedBySomeone = (records.length !== 0); // create operation
      const isBeingUsedByMe = records.some(record => record.id === doc.id); // update operation

      const isValid = (!isBeingUsedBySomeone || isBeingUsedByMe);
      return isValid;
    },
  }
};


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
