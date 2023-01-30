import {
  sms2FACancelResolver,
  sms2FACheckResolver,
  sms2FAVerifyResolver,
} from './resolvers/index.js';

export const connect = (app, model) => {
  app.post('/authentication/2FA/cancel', sms2FACancelResolver);
  app.post('/authentication/2FA/check', sms2FACheckResolver);
  app.post('/authentication/2FA/verify', sms2FAVerifyResolver(model));
};
