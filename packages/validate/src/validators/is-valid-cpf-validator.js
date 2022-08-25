const { isCPF } = require('brazilian-values');

exports.isValidCpfValidator = (field = 'cpf') => (doc = {}) => ({
  code: 'VALIDATOR_ERROR_INVALID_CPF',
  field,
  validator: () => {
    const isValid = isCPF(doc[field]);
    return isValid;
  },
});
