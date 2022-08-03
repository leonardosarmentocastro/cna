# authentication

authentication using express mongoose

## exposed routes

`/authentication/sign-in`
`/authentication/sign-up`

## environment variables

* `AUTHENTICATION_SECRET`: secret used to sign jwt tokens when signing tokens;

## translation keys

* `AUTHENTICATION_ERROR_EMAIL_NOT_FOUND`:
* `AUTHENTICATION_ERROR_PASSWORD_MISMATCH`:
* `AUTHENTICATION_ERROR_TOKEN_EXPIRED`:
* `AUTHENTICATION_ERROR_TOKEN_INVALID`:
* `AUTHENTICATION_ERROR_TOKEN_NOT_BEFORE`:
* `VALIDATOR_ERROR_PASSWORD_NOT_STRONG`:
* `VALIDATOR_ERROR_FIELD_IS_REQUIRED`:

## TODO

* registrar tokens no model (se possível atrelado ao dispositivo aonde login foi feito)
* rota de logout apaga o(s) token(s) no model
* /me obtém os dados do usuário a partir do token
*
