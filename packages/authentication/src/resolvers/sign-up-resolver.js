import { createResolver } from '@leonardosarmentocastro/crud';

import { DEFAULTS } from '../defaults.js';
import { signTokenResolver } from './sign-token-resolver.js';

export const signUpResolver = (model = DEFAULTS.model) => [
  createResolver(model, { sensitive: true }),
  signTokenResolver(model),
];
