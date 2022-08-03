const test = require('ava');
const zxcvbn = require('zxcvbn');

const { isPasswordStrongValidator } = require('../../is-password-strong-validator');

const WEAK_PASSWORDS = [
  '123456789', // score 0
  '12345678910' // score 1
];
const STRONG_PASSWORDS = [
  'abc123def4', // score 2
  'abc123def!@#' // score 3
];

test('"password" is strong if analysis score appoints 2 or above', t => {
  WEAK_PASSWORDS.forEach(password =>
    t.falsy(
      isPasswordStrongValidator({ password }).validator()
    )
  );

  STRONG_PASSWORDS.forEach(password =>
    t.truthy(
      isPasswordStrongValidator({ password }).validator()
    )
  );
});

test('must also provide analysis "score" and "feedback" on validator payload', t => {
  [ ...WEAK_PASSWORDS, ...STRONG_PASSWORDS ].forEach(password => {
    const payload = isPasswordStrongValidator({ password });
    const { feedback, score } = zxcvbn(password);

    t.deepEqual(payload.analysis, { feedback, score });
  });
});
