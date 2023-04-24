const { DEFAULTS } = require('../defaults');
const { translatedUnexpectedError } = require('../errors');

exports.readResolver = (model = DEFAULTS.model, options = { sensitive: true }) => async (req, res) => {
  try {
    const found = await model.paginate(req.pagination, options);
    return res.status(200).json(found);
  } catch(err) {
    return translatedUnexpectedError(req, res, { err });
  }
};
