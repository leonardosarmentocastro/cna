import twoFactor from './2FA/index.js';
import { connect } from './connect.js';
import { authenticationMiddleware } from './middleware/index.js';
import { authenticationSchema } from './schema.js';

export {
  authenticationMiddleware,
  authenticationSchema,
  connect,
  twoFactor,
};

export default {
  authenticationMiddleware,
  authenticationSchema,
  connect,
  twoFactor,
};
