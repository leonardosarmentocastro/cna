exports.isTooLongValidator = (field = '', maxLength = 0) => (doc = {}) => ({
  code: 'VALIDATOR_ERROR_FIELD_IS_TOO_LONG',
  field,
  maxLength,
  validator: () => {
    // TODO: unit test
    const isValid = (doc[field].length <= maxLength);
    return isValid;
  },
});
