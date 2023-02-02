import { getModelPath } from '@leonardosarmentocastro/crud';
import {
  sms2FACancelResolver,
  sms2FACheckResolver,
  sms2FAVerifyResolver,
} from './resolvers/index.js';

export const connect = (app, model) => {
  const basePath = getModelPath(model); // "/customers"
  console.log(`[ authentication::info ] creating authentication 2FA routes for "/authentication/2FA${basePath}"`);

  app.post('/authentication/2FA/cancel', sms2FACancelResolver);
  app.post('/authentication/2FA/check', sms2FACheckResolver);
  app.post('/authentication/2FA/verify', sms2FAVerifyResolver(model));
};
