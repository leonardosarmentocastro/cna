const { isJSON, isNumeric } = require('validator');

const { PAGINATION_ERROR_QUERY_PARAMETER_INVALID } = require('./errors');

const includesSortingSuffix = (field) =>
  ['+', '-'].some(sortingSuffix => {
    const lastCharacter = field.slice(-1);
    return lastCharacter === sortingSuffix;
  });

const isInAgreementWithConvention = (string) => {
  if (!string) return true; // sorting is optional.
  if (string.trim().length <= 1) return false; // expect combination of "prop + suffix" (e.g. "a+").

  const fields = string.split(';');
  return fields.every(includesSortingSuffix);
};

const constraints = [
  {  field: 'c',  validator: (string) => isJSON(string) },
  {  field: 'l',  validator: (string) => isNumeric(string) && (string >= 1) },
  {  field: 'p',  validator: (string) => isNumeric(string) && (string >= 1) },
  {  field: 's',  validator: (string) => isInAgreementWithConvention(string) },
].map(constraint => ({ ...constraint, ...PAGINATION_ERROR_QUERY_PARAMETER_INVALID }));

exports.validate = (queryParameters) =>
  constraints.reduce((err, constraint) => {
    if (!!err) return err; // Stick with first encountered error.

    const { validator, ...error } = constraint;
    const string = queryParameters[error.field];
    const isValid = validator(string);

    return isValid ? null : error;
  }, null);
