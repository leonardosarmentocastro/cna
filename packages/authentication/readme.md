# authentication

authentication using express mongoose

## usage

```js
const mongoose = require('mongoose');
const server = require('@leonardosarmentocastro/server');
const i18n = require('@leonardosarmentocastro/i18n'); // mandatory
const { authentication, authenticationSchema } = require('@leonardosarmentocastro/authentication');

(async () => {
  const api = await server.start(8080, {
    middlewares: (app) => {
      i18n.connect(app); // mandatory
    },
    routes: (app) => {
      const schema = new mongoose.Schema({ authentication: authenticationSchema, name: String });
      const model = new mongoose.model('Customer', schema);

      // creates
      // * "[GET] /authentication/me"
      // * "[POST] /authentication/sign-in"
      // * "[POST] /authentication/sign-out"
      // * "[POST] /authentication/sign-up"
      authentication.connect(app, model);

      // creates
      // * "[POST] /authentication/2FA/cancel"
      // * "[POST] /authentication/2FA/check"
      // * "[POST] /authentication/2FA/verify"
      authentication.twoFactor.connect(app, model);
    },
  });
})();
```

## exposed routes

For authentication

- `[GET] /authentication/me`: serves authenticated model data;
- `[POST] /authentication/sign-in`: validates token + authenticates an model, saving a JWT Authorization token to the model and attaching it to response's header;
- `[POST] /authentication/sign-up`: creates/authenticates an model, saving a JWT Authorization token to the model and attaching it to response's header;
- `[POST] /authentication/sign-out`: validates token + remove JWT Authorization token from model and remove it from response's header.

For 2FA verification

- `[POST] /authentication/2FA/cancel`: cancel the verification request before the 5 minute duration runs out;
- `[POST] /authentication/2FA/check`: checks if the served 4 digit PIN sent by the user, matches the one sent to the given cellphone number;
- `[POST] /authentication/2FA/verify`: sends a SMS with a 4 digit PIN code to a given cellphone number.

## environment variables

* `AUTHENTICATION_SECRET`: secret used to sign jwt tokens when signing tokens;
* `AUTHENTICATION_SMS_2FA_VONAGE_API_KEY`: API key for sending 2FA SMS using `Vonage`;
* `AUTHENTICATION_SMS_2FA_VONAGE_API_SECRET`: API secret for sending 2FA SMS using `Vonage`;
* `AUTHENTICATION_SMS_2FA_SENDER_NAME`: The sender name that is going to be written on 2FA SMS messages.

## translation keys

For schema validation:

* `AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE_NUMBER`
* `AUTHENTICATION_VALIDATOR_ERROR_INVALID_TOKENS`
* `VALIDATOR_ERROR_PASSWORD_NOT_STRONG`
* `VALIDATOR_ERROR_FIELD_IS_REQUIRED`

For endpoint resolvers:

* `AUTHENTICATION_ERROR_CELLPHONE_NUMBER_NOT_FOUND`
* `AUTHENTICATION_ERROR_PASSWORD_MISMATCH`
* `AUTHENTICATION_ERROR_REGISTRY_FOR_TOKEN_NOT_FOUND`
* `AUTHENTICATION_ERROR_TOKEN_EXPIRED`
* `AUTHENTICATION_ERROR_TOKEN_INVALID`
* `AUTHENTICATION_ERROR_TOKEN_NOT_BEFORE`

For cellphone 2FA through SMS using `Vonage`:

* `AUTHENTICATION_SMS_2FA_CANCEL_UNEXPECTED_ERROR`
* `AUTHENTICATION_SMS_2FA_CHECK_UNEXPECTED_ERROR`
* `AUTHENTICATION_SMS_2FA_CELLPHONE_NUMBER_ALREADY_REGISTERED`
* `AUTHENTICATION_SMS_2FA_VERIFICATION_UNEXPECTED_ERROR`
