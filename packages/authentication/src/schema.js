const mongoose = require('mongoose');

const { encrypter } = require('./encrypter');
const {
  isPasswordStrongValidator,
  isRequiredValidator,
  isValidEmailValidator,
  validate,
} = require('@leonardosarmentocastro/validate');

// Schema definitions
const authenticationSchema = new mongoose.Schema({
  _id: false,
  email: { type: String },
  password: { type: String },
  // TODO: tokens: [],
});

// Middlewares
const preSaveMiddleware = async function() {
  const schema = this;

  const isPasswordHashed = encrypter.isHashed(schema.password);
  if (!isPasswordHashed) schema.password = await encrypter.hash(schema.password);
}

const validationsMiddleware = async (authorizationDoc, next) => {
  const constraints = [
    ...['email', 'password'].map(field => isRequiredValidator(field)),
    isValidEmailValidator,
    isPasswordStrongValidator,
  ];
  const error = await validate(constraints, authorizationDoc);

  return next(error);
};

const transform = (doc, ret) => {
  const { password, ...fields } = ret;
  return fields;
};

// Setup
authenticationSchema.pre('save', preSaveMiddleware);
authenticationSchema.post('validate', validationsMiddleware);
authenticationSchema.set('toObject', { transform });

module.exports = {
  preSaveMiddleware,
  authenticationSchema
};
