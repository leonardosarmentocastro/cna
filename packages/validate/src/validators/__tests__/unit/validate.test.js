const test = require('ava');

const { isRequiredValidator } = require('../../is-required-validator');
const { validate } = require('../../../validate');

const constraints = [ isRequiredValidator('email'), isRequiredValidator('username') ];
test('must return "code", "field", "message" fields of the first error it faces', async t => {
  const userDoc1 = { email: '', username: '' };
  const { validator: validator1, ...error1 } = isRequiredValidator('email')(userDoc1);
  t.deepEqual(await validate(constraints, userDoc1), error1);

  const userDoc2 = { email: 'email@domain.com', username: '' };
  const { validator: validator2, ...error2 } = isRequiredValidator('username')(userDoc2);
  t.deepEqual(await validate(constraints, userDoc2), error2);
});

test('must return "null" if no error was raised while checking constraints', async t => {
  const userDoc = { email: 'email@domain.com', username: 'username' };
  t.is(await validate(constraints, userDoc), null);
});
