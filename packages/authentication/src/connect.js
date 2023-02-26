import { getModelPath } from '@leonardosarmentocastro/crud';
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
  const basePath = getModelPath(model); // "/customers"
  const fullPath = `${basePath}/authentication`;
  console.log(`[ authentication::info ] creating authentication routes for "${fullPath}"`);

  app.get(`${fullPath}/me`, [ authenticationMiddleware, meResolver(model), serveMeResolver ]);
  app.post(`${fullPath}/sign-in`, [ signInResolver(model), signTokenResolver(model) ] );
  app.post(`${fullPath}/sign-out`, [ authenticationMiddleware, meResolver(model), signOutResolver ]);
  app.post(`${fullPath}/sign-up`, signUpResolver(model));
};
