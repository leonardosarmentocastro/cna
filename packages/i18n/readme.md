### i18n

summary

- store under `./translations` folder, `.yml` files that corresponds to an available language (e.g. `.translations/en-us.yml`)
- translation files are interpreted by [messageformat engine](https://github.com/messageformat/messageformat) engine
- each translation file contains a set of lines as `key:value`, e.g:
  ```yml
  SHARED_ERROR_EMAIL_INVALID: The email "{email}" is invalid.
  USERS_ERROR_USER_NOT_FOUND: User "{userId}" was not found.
  ```
- the default language is set by `process.env.LANGUAGE` and is available in all requests by `req.locale` prop


usage

  ```yml
  # .translations/en-us.yml
  TRANSLATED_HELLO: Hello "{name}". Welcome!
  ```

  ```yml
  # .translations/pt-br.yml
  TRANSLATED_HELLO: Olá "{name}". Bem vindo!
  ```

  ```js
  // index.js
  process.env.LOCALE = 'en-us.yml';
  const server = require('@leonardosarmentocastro/server');
  const i18n = require('@leonardosarmentocastro/i18n');

  (async () => {
    await server.start(8080, {
      connect: (app) => {
        i18n.connect(app);

        app.get('/translated', (req, res) => {
          const key = 'TRANSLATED_HELLO';
          const args = { name: 'Leonardo' };
          const translation = i18n.translate.get(key, req.locale, args);

          return res.status(200).send(translation);
        });
      },
    });
  })();
  ```

  ```sh
  curl -X GET http://localhost:8080/translated -H 'accept-language: en-us'
  # Hello "Leonardo". Welcome!

  curl -X GET http://localhost:8080/translated -H 'accept-language: pt-br'
  # Olá "Leonardo". Bem vindo!
  ```
