const SCHEMA_NOT_SETTABLE_FIELDS = [ 'id', '_id', 'createdAt', 'updatedAt' ];
const sanitizer = (schema, fieldsToRemove = SCHEMA_NOT_SETTABLE_FIELDS) =>
  Object.keys(schema)
    .filter(key => !fieldsToRemove.includes(key))
    .reduce((accumulator, key) => ({ ...accumulator, [key]: schema[key] }), {});

module.exports = {
  SCHEMA_NOT_SETTABLE_FIELDS,
  sanitizer,
};
