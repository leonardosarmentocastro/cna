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

export {
  authenticationMiddleware,
  authenticationSchema,
  authenticationSocketMiddleware,
  connect,
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
  meResolver,
  serveMeResolver,
  signInResolver,
  signOutResolver,
  signTokenResolver,
  signUpResolver,
  twoFactor,
};
