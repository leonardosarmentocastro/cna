exports.isAlreadyInUseValidator = (field = '') => (doc = {}) => ({
  code: 'VALIDATOR_ERROR_FIELD_IS_ALREADY_IN_USE',
  field,
  validator: async () => {
    const model = doc.constructor;
    const records = await model.find({ [field]: doc[field] });

    // NOTE: Both "create" and "update" operations run validations appended to ".save" method.
    // We **must** validate both cases, cause:
    // If you create an user with username "username123" and update any other field later on,
    // the update operation would not be successful due to the username field being used by yourself.
    const isBeingUsedBySomeone = (records.length !== 0); // create operation
    const isBeingUsedByMe = records.some(record => record.id === doc.id); // update operation

    const isValid = (!isBeingUsedBySomeone || isBeingUsedByMe);
    return isValid;
  },
});
