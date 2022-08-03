const { sanitizer } = require('@leonardosarmentocastro/database');

const { DEFAULTS } = require('../defaults');
const { translatedError } = require('../errors');

exports.createResolver = (model = DEFAULTS.model) => async (req, res, next) => {
  const payload = sanitizer(req.body);
  const doc = new model(payload);

  try {
    const savedDoc = await doc.save();
    const transformedDoc = savedDoc.toObject();
    req.createdDoc = transformedDoc;

    next();
  } catch(err) {
    return translatedError(req, res, { err, doc });
  }
};

exports.serveCreatedDocResolver = (req, res) => res.status(200).json(req.createdDoc);
