const test = require('ava');

const { database } = require('@leonardosarmentocastro/database');
const {
  isPasswordStrongValidator,
  isRequiredValidator,
  isValidEmailValidator,
} = require('@leonardosarmentocastro/validate');
const { DEFAULTS } = require('../../defaults');

// Setup
test.before('connect to database', t => database.connect());
test.before('create sample "AuthenticationModel" model to work with on tests', t => {
  t.context.AuthenticationModel = DEFAULTS.model;
});

const VALID_DOC = {
  email: 'valid-email@domain.com',
  password: 'v@l1dpAssw0rD',
};

test('(validationsMiddleware) must throw an error if "email" is missing', async t => {
  const doc = { ...VALID_DOC, email: '' };
  const { validator, ...err } = isRequiredValidator('email')(doc);

  await new t.context.AuthenticationModel(doc).save()
    .catch(error => t.deepEqual(error, err));
});

test('(validationsMiddleware) must throw an error if "email" is invalid', async t => {
  const doc = { ...VALID_DOC, email: '123##invalid@@email!.com' };
  const { validator, ...err } = isValidEmailValidator(doc);

  await new t.context.AuthenticationModel(doc).save()
    .catch(error => t.deepEqual(error, err));
});

test('(validationsMiddleware) must throw an error if "password" is missing', async t => {
  const authenticationDoc = { ...VALID_DOC, password: '' };
  const { validator, ...err } = isRequiredValidator('password')(authenticationDoc);

  await new t.context.AuthenticationModel(authenticationDoc).save()
    .catch(error => t.deepEqual(error, err));
});

test('(validationsMiddleware) must throw an error if "password" is not strong enough', async t => {
  const authenticationDoc = { ...VALID_DOC, password: '123456' };
  const { validator, ...err } = isPasswordStrongValidator(authenticationDoc);

  await new t.context.AuthenticationModel(authenticationDoc).save()
    .catch(error => t.deepEqual(error, err));
});

test('(transform) must hide property "password" when transforming doc to json object', async t => {
  const doc = await t.context.AuthenticationModel.create(VALID_DOC);
  const transformedDoc = doc.toObject();

  t.truthy(transformedDoc.email);
  t.falsy(transformedDoc.password);
});
