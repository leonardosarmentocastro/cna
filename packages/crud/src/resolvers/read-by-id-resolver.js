const { isMongoId } = require('validator');

const { documentNotFoundError, translatedUnexpectedError } = require('../errors');
const { DEFAULTS } = require('../defaults');

exports.readByIdResolver = (model = DEFAULTS.model, options = { sensitive: true }) => async (req, res) => {
  try {
    const id = req.params.id;
    if (!isMongoId(id)) return documentNotFoundError(req, res);

    const doc = await model.findById(id);
    if (!doc) return documentNotFoundError(req, res);

    const transformedDoc = doc.toObject(options);
    return res.status(200).json(transformedDoc);
  } catch(err) {
    return translatedUnexpectedError(req, res, { err });
  }
};
