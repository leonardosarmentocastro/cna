import Mongoose from 'mongoose';
import {
  isPasswordStrongValidator,
  isRequiredValidator,
  validate,
} from '@leonardosarmentocastro/validate';

import { encrypter } from './encrypter.js';
import {
  isValidCellphoneNumberValidator,
  // isValidUseChoiceValidator, // TODO: provide a way to register using email
  areValidTokensValidator,
} from './validators.js';

// Schema definitions
export const authenticationSchema = new Mongoose.Schema({
  _id: false,
  cellphoneNumber: String,
  // email: String, // TODO: provide a way to register using email
  // use: String, // TODO: provide a way to register using email
  password: String,
  require2FA: { type: Boolean, default: false },
  tokens: [ String ],
});

// Middlewares
authenticationSchema.pre('save', async function() {
  const doc = this;

  const isPasswordHashed = encrypter.isHashed(doc.password);
  if (!isPasswordHashed) doc.password = await encrypter.hash(doc.password);
});

authenticationSchema.post('validate', async (doc, next) => {
  const constraints = [
    ...[
      'cellphoneNumber',
      'password',
      // 'use', // TODO: provide a way to register using email
    ].map(field => isRequiredValidator(field)),
    // isValidUseChoiceValidator, // TODO: provide a way to register using email
    isValidCellphoneNumberValidator,
    isPasswordStrongValidator,
    areValidTokensValidator,
  ];
  const error = await validate(constraints, doc);

  return next(error);
});

authenticationSchema.set('toObject', {
  transform: (doc, ret, options = { sensitive: true }) => {
    if (options.sensitive) {
      const { password, tokens, ...fields } = ret;
      return fields;
    }

    return ret;
  },
});
