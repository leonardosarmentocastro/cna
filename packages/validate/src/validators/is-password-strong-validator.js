const zxcvbn = require('zxcvbn');

exports.isPasswordStrongValidator = (doc = {}) => {
  const analysis = zxcvbn(doc.password);

  return {
    // NOTE: Still not translated as library don't have explicit mapping for errors.
    // https://github.com/dropbox/zxcvbn/blob/master/src/feedback.coffee
    analysis: {
      feedback: analysis.feedback,
      score: analysis.score,
    },
    code: 'VALIDATOR_ERROR_PASSWORD_NOT_STRONG',
    field: 'password',
    validator: () => {
      // * Integer from 0-4 (useful for implementing a strength bar):
      // * 0 too guessable: risky password. (guesses < 10^3)
      // * 1 very guessable: protection from throttled online attacks. (guesses < 10^6)
      // * 2 somewhat guessable: protection from unthrottled online attacks. (guesses < 10^8)
      // * 3 safely unguessable: moderate protection from offline slow-hash scenario. (guesses < 10^10)
      // * 4 very unguessable: strong protection from offline slow-hash scenario. (guesses >= 10^10)
      const isValid = (analysis.score >= 2);
      return isValid;
    },
  }
};
