const { translate } = require('@leonardosarmentocastro/i18n');

const ERROR_DOCUMENT_NOT_FOUND = { code: 'ERROR_DOCUMENT_NOT_FOUND', field: 'id' };
const documentNotFoundError = (req, res) =>
  res.status(500).json(
    translate.error(ERROR_DOCUMENT_NOT_FOUND, req.locale, { id: req.params.id })
  );

const ERROR_UNEXPECTED = { code: 'ERROR_UNEXPECTED', field: '' };
const translatedUnexpectedError = (req, res, { err }) =>
  res.status(500).json({
    ...translate.error(ERROR_UNEXPECTED, req.locale, {}),
    stacktrace: err.stack, // NOTE: "Error" interface contains "err.stack" prop.
  });

const translatedError = (req, res, { err, doc }) => {
  const transformedDoc = doc.toObject();
  const error = translate.error(err, req.locale, transformedDoc);

  return res.status(500).json(error);
};

module.exports = {
  ERROR_DOCUMENT_NOT_FOUND,
  ERROR_UNEXPECTED,
  documentNotFoundError,
  translatedError,
  translatedUnexpectedError,
};
