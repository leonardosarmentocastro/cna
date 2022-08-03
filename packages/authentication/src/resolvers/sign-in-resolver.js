const { isRequiredValidator, validate } = require('@leonardosarmentocastro/validate');

const { DEFAULTS } = require('../defaults');
const { encrypter } = require('../encrypter');
const {
  translatedError,
  AUTHENTICATION_ERROR_EMAIL_NOT_FOUND,
  AUTHENTICATION_ERROR_PASSWORD_MISMATCH,
} = require('../errors');

exports.signInResolver = (model = DEFAULTS.model) => async (req, res, next) => {
  try {
    const constraints = [ ...[ 'email', 'password' ].map(field => isRequiredValidator(field)) ];
    const err = await validate(constraints, req.body);
    if (err) throw { err, statusCode: 400 };

    const { email, password } = req.body;
    const doc = await model.findOne({ email });
    if (!doc) throw { err: AUTHENTICATION_ERROR_EMAIL_NOT_FOUND, statusCode: 404 };

    const hasMatched = await encrypter.verify(doc.password, password);
    if (!hasMatched) throw { err: AUTHENTICATION_ERROR_PASSWORD_MISMATCH, statusCode: 404 };

    const transformedDoc = doc.toObject();
    req.signedInDoc = transformedDoc;
    next();
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
