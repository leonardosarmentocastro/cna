const test = require('ava');

const { sanitizer, SCHEMA_NOT_SETTABLE_FIELDS } = require('../../sanitizer');

test('[sanitizer] must remove not settable fields from schema', t => {
  const settableField = 'must not be removed';
  const schema = SCHEMA_NOT_SETTABLE_FIELDS
    .reduce((accumulator, field) => ({ ...accumulator, [field]: 'some value' }), {}); // { id: "some value", createAt: "some value" ... }

  t.deepEqual(
    sanitizer({ ...schema, settableField }),
    { settableField },
  );

  const notSettableField = 'must be removed';
  const fieldsToRemove = [ 'notSettableField' ];
  t.deepEqual(
    sanitizer({ ...schema, notSettableField }, fieldsToRemove),
    schema
  );
});
