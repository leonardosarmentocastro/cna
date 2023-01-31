import {
  meResolver,
  serveMeResolver,
  signInResolver,
  signOutResolver,
  signTokenResolver,
  signUpResolver,
} from './resolvers/index.js';
import { authenticationMiddleware } from './middleware/index.js';

export const connect = (app, model) => {
  app.get('/authentication/me', [ authenticationMiddleware, meResolver(model), serveMeResolver ]);
  app.post('/authentication/sign-in', [ signInResolver(model), signTokenResolver(model) ] );
  app.post('/authentication/sign-up', signUpResolver(model));
  app.post('/authentication/sign-out', [ authenticationMiddleware, meResolver(model), signOutResolver ]);
};
