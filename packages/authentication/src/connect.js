import {
  meResolver,
  serveMeResolver,
  signInResolver,
  signOutResolver,
  signTokenResolver,
  signUpResolver,
} from './resolvers/index.js';
import { authenticationMiddleware } from './middleware/index.js';

// TODO: use "crud" package resolvers alongside "meResolver" to enable a model updating/deleting its own data
export const connect = (app, model) => {
  // const { modelName } = model.collection; // "Customer"
  // const pluralizedModelName = pluralize(modelName); // "Customers"
  // const basePath = `/${kebabCase(pluralizedModelName)}`; // "/customers"
  // console.log(`[ authentication::info ] creating authentication routes for "/authentication/${basePath}"`);

  app.get('/authentication/me', [ authenticationMiddleware, meResolver(model), serveMeResolver ]);
  app.post('/authentication/sign-in', [ signInResolver(model), signTokenResolver(model) ] );
  app.post('/authentication/sign-out', [ authenticationMiddleware, meResolver(model), signOutResolver ]);
  app.post('/authentication/sign-up', signUpResolver(model));
};
