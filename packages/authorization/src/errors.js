const { translate } = require('@leonardosarmentocastro/i18n');

exports.AUTHORIZATION_ERROR_INVALID_TOKEN = {
  code: 'AUTHORIZATION_ERROR_INVALID_TOKEN',
};

exports.authorizationTranslatedError = (req, res, { err }) =>
  res.status(401).json(
    translate.error(err, req.locale, {})
  );
