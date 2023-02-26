import { getModelPath } from '@leonardosarmentocastro/crud';
import {
  sms2FACancelResolver,
  sms2FACheckResolver,
  sms2FAVerifyResolver,
} from './resolvers/index.js';

export const connect = (app, model) => {
  const basePath = getModelPath(model); // "/customers"
  const fullPath = `${basePath}/authentication/2FA`;
  console.log(`[ authentication::info ] creating authentication 2FA routes for "${fullPath}"`);

  app.post(`${fullPath}/cancel`, sms2FACancelResolver);
  app.post(`${fullPath}/check`, sms2FACheckResolver);
  app.post(`${fullPath}/verify`, sms2FAVerifyResolver(model));
};
