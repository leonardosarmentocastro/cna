import { signInResolver, signTokenResolver, signUpResolver } from './resolvers/index.js';

export const connect = (app, model) => {
  app.post('/authentication/sign-in', [ signInResolver(model), signTokenResolver ] );
  app.post('/authentication/sign-up', signUpResolver(model));
};
