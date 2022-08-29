const test = require('ava');

const { isRequiredValidator } = require('../../is-required-validator');

test('validator must return "false" if specified field is empty', t => {
  const userDoc = {
    email: '',
    username: 'not empty',
    emptyList: [],
    notEmptyList: [ '1' ],
    emptyObject: {},
    notEmptyObject: { a: '1' },
  };

  t.false(
    isRequiredValidator('email')(userDoc).validator()
  );
  t.true(
    isRequiredValidator('username')(userDoc).validator()
  );
  t.false(
    isRequiredValidator('emptyList')(userDoc).validator()
  );
  t.true(
    isRequiredValidator('notEmptyList')(userDoc).validator()
  );
  t.false(
    isRequiredValidator('emptyObject')(userDoc).validator()
  );
  t.true(
    isRequiredValidator('notEmptyObject')(userDoc).validator()
  );
});
