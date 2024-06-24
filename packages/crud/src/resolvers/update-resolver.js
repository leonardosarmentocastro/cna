const { isMongoId } = require('validator');

const { DEFAULTS } = require('../defaults');
const { documentNotFoundError, translatedError } = require('../errors');
const { sanitizer } = require('@leonardosarmentocastro/database');

exports.updateResolver = (model = DEFAULTS.model, options = DEFAULTS.options) => async (req, res) => {
  const { id } = req.params;
  if (!isMongoId(id)) return documentNotFoundError(req, res);

  const doc = await model.findById(id);
  if (!doc) return documentNotFoundError(req, res);

  const payload = sanitizer(req.body);
  const docToUpdate = Object.assign(doc, payload);

  try {
    const updatedDoc = await docToUpdate.save({ validateBeforeSave: options.validateBeforeSave });
    const transformedDoc = updatedDoc.toObject(options);

    return res.status(200).json(transformedDoc);
  } catch(err) {
    return translatedError(req, res, { err, doc });
  }
};
