const test = require('ava');

const { isTooLongValidator } = require('../../is-too-long-validator');

test(`validator must return "false" when field has exceeded a specific amount of characters`, t => {
  const maxLength = 24;
  const userDoc = { username: 'a'.repeat(maxLength + 1) };

  t.false(
    isTooLongValidator('username', maxLength)(userDoc).validator()
  );
});
