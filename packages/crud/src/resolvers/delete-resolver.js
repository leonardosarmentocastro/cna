const { isMongoId } = require('validator');

const { documentNotFoundError, translatedUnexpectedError } = require('../errors');
const { DEFAULTS } = require('../defaults');

exports.deleteResolver = (model = DEFAULTS.model) => async (req, res) => {
  try {
    const id = req.params.id;
    if (!isMongoId(id)) return documentNotFoundError(req, res);

    await model.deleteOne({ _id: id });

    return res.status(200).end();
  } catch(err) {
    return translatedUnexpectedError(req, res, { err });
  }
};
