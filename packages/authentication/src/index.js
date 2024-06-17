import twoFactor from './2FA/index.js';
import { connect } from './connect.js';
import { authenticationMiddleware, authenticationSocketMiddleware } from './middleware/index.js';
import { authenticationSchema } from './schema.js';
import {
  meResolver,
  serveMeResolver,
  signInResolver,
  signOutResolver,
  signTokenResolver,
  signUpResolver,
} from './resolvers/index.js';
import { isCellphoneNumberAlreadyInUseValidator } from './validators.js';

export {
  authenticationMiddleware,
  authenticationSchema,
  authenticationSocketMiddleware,
  connect,
  isCellphoneNumberAlreadyInUseValidator,
  meResolver,
  serveMeResolver,
  signInResolver,
  signOutResolver,
  signTokenResolver,
  signUpResolver,
  twoFactor,
};

export default {
  authenticationMiddleware,
  authenticationSchema,
  authenticationSocketMiddleware,
  connect,
  isCellphoneNumberAlreadyInUseValidator,
  meResolver,
  serveMeResolver,
  signInResolver,
  signOutResolver,
  signTokenResolver,
  signUpResolver,
  twoFactor,
};
