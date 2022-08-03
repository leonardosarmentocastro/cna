const { translate } = require('@leonardosarmentocastro/i18n');

exports.PAGINATION_ERROR_QUERY_PARAMETER_INVALID = {
  code: 'PAGINATION_ERROR_QUERY_PARAMETER_INVALID',
};

exports.paginationTranslatedValidationError = (req, res, { err }) =>
  res.status(500).json(
    translate.error(err, req.locale, {})
  );
