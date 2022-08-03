const plugTransformations = (fromSchema, toSchema) => {
  const newTransformation = fromSchema.options.toObject?.transform;
  if (!newTransformation) return; // can't plug if there is nothing to plug!

  const ownTransformation = toSchema.options.toObject?.transform;
  if (!ownTransformation) return toSchema.set('toObject', {
    ...toSchema.options.toObject,
    transform: newTransformation,
  });

  // apply own transformation before new transformations
  toSchema.set('toObject', {
    ...toSchema.options.toObject,
    transform: (doc, ret, options) => {
      const transformed = ownTransformation(doc, ret, options);
      return newTransformation(doc, transformed, options);
    },
  });
};

exports.plugSchema = (fromSchema) => (toSchema) => {
  toSchema.add(fromSchema); // https://mongoosejs.com/docs/api/schema.html#schema_Schema-add
  plugTransformations(fromSchema, toSchema); // http://thecodebarbarian.com/2015/03/06/guide-to-mongoose-plugins
};
