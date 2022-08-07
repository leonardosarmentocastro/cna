import mongoose from 'mongoose';
import { commonSchema, plugSchema, transform } from '@leonardosarmentocastro/database';
import { paginationPlugin } from '@leonardosarmentocastro/pagination';
import {
  isAlreadyInUseValidator,
  isRequiredValidator,
  isTooLongValidator,
  isValidEmailValidator,
  validate,
} from '@leonardosarmentocastro/validate';

export const usersSchema = new mongoose.Schema({
  email: String,
  username: String,
});

// Middlewares
export const USERS_USERNAME_MAX_LENGTH = 24;
const validationsMiddleware = async (userDoc, next) => {
  const constraints = [
    ...['email', 'username'].map(field => isRequiredValidator(field)),
    ...['email', 'username'].map(field => isAlreadyInUseValidator(field)),
    isTooLongValidator('username', USERS_USERNAME_MAX_LENGTH),
    isValidEmailValidator,
  ];
  const error = await validate(constraints, userDoc);

  return next(error);
};

// Setup
usersSchema.set('toObject', {
  transform,
  virtuals: true // Expose "id" instead of "_id".
});
usersSchema.plugin(plugSchema(commonSchema));
usersSchema.plugin(paginationPlugin);
usersSchema.post('validate', validationsMiddleware);

export const UsersModel = mongoose.model('User', usersSchema);
