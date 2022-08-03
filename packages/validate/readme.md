# validate

validate constraints (specially) in mongoose models

e.g. for mongoose models:

```js
// model.js
const mongoose = require('mongoose');
const { validate, isRequiredValidator, isTooLongValidator } = require('@leonardosarmentocastro/validate');

// define your schema
const schema = new mongoose.Schema({
  email: String,
  username: String,
});

// set your validations
schema.post('validate', async (doc, next) => {
  const constraints = [
    ...['username'].map(field => isRequiredValidator(field)),
    isTooLongValidator('username', USERNAME_MAX_LENGTH),
  ];
  const error = await validate(constraints, doc);

  return next(error);
});

// use your model for crud operations
exports.UsersModel = mongoose.model('User', schema);
```

```js
// create.js
const { translate } = require('@leonardosarmentocastro/i18n');
const UsersModel = require('./model');

const userDoc = new UsersModel({ email: '', username: 'leonardo' });
try {
  const savedUser = await userDoc.save();
  const transformedUser = userDoc.toObject();

  return transformedUser;
} catch(err) {
  const transformedUser = userDoc.toObject();
  const error = translate.error(err, 'pt-br', transformedUser);

  // returns:
  // {
  //   code: 'VALIDATOR_ERROR_FIELD_IS_REQUIRED',
  //   message: 'O campo "{field}" é mandatório.',
  // }
  return error;
}
```

### validators

### `isAlreadyInUseValidator = (field = '') => (doc = {})`


Validate wheter a field is already present in some registry for this model.
E.g. checks if user1.email ("banana@email.com") is already being used by any user.

Translation code: `VALIDATOR_ERROR_FIELD_IS_ALREADY_IN_USE`

### `isPasswordStrongValidator = (doc = {})`

Validate if `doc.password` is considered somewhat guessable.

Translation code: `VALIDATOR_ERROR_PASSWORD_NOT_STRONG`

### `isRequiredValidator = (field = '') => (doc = {})`

Validate if a field is present/not empty.

Translation code: `VALIDATOR_ERROR_FIELD_IS_REQUIRED`

### `isTooLongValidator = (field = '', maxLength = 0) => (doc = {})`

Validate if a string field has exceeded a given max length.

Translation code: `VALIDATOR_ERROR_FIELD_IS_TOO_LONG`

### `isValidEmailValidator = (doc = {})`

Validate if field "doc.email" is a valid email.

Translation code: `VALIDATOR_ERROR_EMAIL_INVALID`

## translations

its mandatory to set these translations codes to their respective files:

* `VALIDATOR_ERROR_FIELD_IS_ALREADY_IN_USE`
* `VALIDATOR_ERROR_PASSWORD_NOT_STRONG`
* `VALIDATOR_ERROR_FIELD_IS_REQUIRED`
* `VALIDATOR_ERROR_FIELD_IS_TOO_LONG`
* `VALIDATOR_ERROR_EMAIL_INVALID`

e.g.

```yml
# ./translations/en-us.yml
VALIDATOR_ERROR_FIELD_IS_ALREADY_IN_USE: This "{field}" is already in use.
VALIDATOR_ERROR_PASSWORD_NOT_STRONG: Password is not strong enough.
VALIDATOR_ERROR_FIELD_IS_REQUIRED: The field "{field}" is required.
VALIDATOR_ERROR_FIELD_IS_TOO_LONG: The field "{field}" is too long (max length is {maxLength}).
VALIDATOR_ERROR_EMAIL_INVALID: The email "{email}" is invalid.

# ./translations/pt-br.yml
VALIDATOR_ERROR_FIELD_IS_ALREADY_IN_USE: Este "{field}" já está em uso.
VALIDATOR_ERROR_PASSWORD_NOT_STRONG: Senha não é forte o bastante.
VALIDATOR_ERROR_FIELD_IS_REQUIRED: O campo "{field}" é mandatório.
VALIDATOR_ERROR_FIELD_IS_TOO_LONG: O campo "{field}" é longo demais (máximo de caracteres é {maxLength}).
VALIDATOR_ERROR_EMAIL_INVALID: O email "{email}" é inválido.
```
