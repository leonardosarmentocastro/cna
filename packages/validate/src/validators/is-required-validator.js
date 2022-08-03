// Pick object's nested fields.
// Reference: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get
const _get = (obj, path, defaultValue) => {
  const result = String.prototype.split.call(path, /[,[\].]+?/)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined) ? res[key] : res, obj);
  return (result === undefined || result === obj) ? defaultValue : result;
};

exports.isRequiredValidator = (field = '') => (doc = {}) => ({
  code: 'VALIDATOR_ERROR_FIELD_IS_REQUIRED',
  field,
  validator: () => {
    const isValid = !!_get(doc, field); // Able to pick nested object fields
    return isValid;
  },
});
