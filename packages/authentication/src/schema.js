import Mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import util from 'util';
import {
  isPasswordStrongValidator,
  isRequiredValidator,
  validate,
} from '@leonardosarmentocastro/validate';

import { encrypter } from './encrypter.js';
import {
  isValidCellphoneNumberValidator,
  isCellphoneAlreadyInUseValidator,
  // isValidUseChoiceValidator, // TODO: provide a way to register using email
} from './validators.js';

const verify = util.promisify(jwt.verify);

// Schema definitions
export const authenticationSchema = new Mongoose.Schema({
  _id: false,
  cellphoneNumber: String,
  // TODO?: add "cpf"
  // email: String, // TODO: provide a way to register using email
  // use: String, // TODO: provide a way to register using email
  password: String,
  require2FA: { type: Boolean, default: false }, // TODO: probably not required.
  requireStrongPassword: { type: Boolean, default: true },
  role: String,
  tokens: [ String ],
});

// Middlewares
authenticationSchema.pre('save', async function() {
  const doc = this;

  const isPasswordHashed = encrypter.isHashed(doc.password);
  if (!isPasswordHashed) doc.password = await encrypter.hash(doc.password);
});

authenticationSchema.post('validate', async function (doc, next) {
  const constraints = [
    ...[
      'cellphoneNumber',
      'password',
      // 'use', // TODO: provide a way to register using email
    ].map(field => isRequiredValidator(field)),
    // isValidUseChoiceValidator, // TODO: provide a way to register using email
    isValidCellphoneNumberValidator,
    isCellphoneAlreadyInUseValidator,
    !!doc.requireStrongPassword ? isPasswordStrongValidator : null,
  ].filter(Boolean);
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

authenticationSchema.pre('save', async function() {
  const doc = this;

  const hasTokens = doc.tokens.length > 0;
  if (!hasTokens) return;

  const verifications = doc.tokens.map(token => verify(token, process.env.AUTHENTICATION_SECRET));
  const results = (await Promise.allSettled(verifications));
  const tokensToConsider = results.map((result, i) => (result.status === 'fulfilled') ? i.toString() : null).filter(Boolean);
  const validTokens = doc.tokens.filter((token, i) => tokensToConsider.includes(i.toString()));
  doc.tokens = validTokens;
});
