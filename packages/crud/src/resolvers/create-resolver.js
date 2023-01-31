const { sanitizer } = require('@leonardosarmentocastro/database');

const { DEFAULTS } = require('../defaults');
const { translatedError } = require('../errors');

// TODO: functional test "options" parameter being sent to transformation "toObject" (used in "authentication" package)
exports.createResolver = (model = DEFAULTS.model, options = { sensitive: true }) => async (req, res, next) => {
  const payload = sanitizer(req.body);
  const doc = new model(payload);

  try {
    const savedDoc = await doc.save();
    const transformedDoc = savedDoc.toObject(options);
    req.createdDoc = transformedDoc;

    next();
  } catch(err) {
    return translatedError(req, res, { err, doc });
  }
};

exports.serveCreatedDocResolver = (req, res) => res.status(200).json(req.createdDoc);
