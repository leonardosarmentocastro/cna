const test = require('ava');

const { isRequiredValidator } = require('../../is-required-validator');

test('validator must return "false" if specified field is empty', t => {
  const userDoc = {
    email: '',
    username: 'not empty',
  };

  t.false(
    isRequiredValidator('email')(userDoc).validator()
  );
  t.true(
    isRequiredValidator('username')(userDoc).validator()
  );
});
