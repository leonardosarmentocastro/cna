const { isCNPJ } = require('brazilian-values');

exports.isValidCnpjValidator = (field = 'cnpj') => (doc = {}) => ({
  code: 'VALIDATOR_ERROR_INVALID_CNPJ',
  field,
  validator: () => {
    const isValid = isCNPJ(doc[field]);
    return isValid;
  },
});
