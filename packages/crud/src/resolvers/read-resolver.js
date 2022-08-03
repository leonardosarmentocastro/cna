const { DEFAULTS } = require('../defaults');
const { translatedUnexpectedError } = require('../errors');

exports.readResolver = (model = DEFAULTS.model) => async (req, res) => {
  try {
    const found = await model.paginate(req.pagination);
    return res.status(200).json(found);
  } catch(err) {
    return translatedUnexpectedError(req, res, { err });
  }
};
