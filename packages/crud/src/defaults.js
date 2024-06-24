const mongoose = require('mongoose');

exports.DEFAULTS = {
  middlewares: [
    (req, res, next) => next(), // idempotent
  ],
  model: mongoose.model('CrudModel', new mongoose.Schema({ example: Boolean })),
  options: {
    sensitive: true, // @leonardosarmentocastro/authentication
    toJson: true, // @leonardosarmentocastro/pagination
    validateBeforeSave: true, // mongoose (https://mongoosejs.com/docs/guide.html#validateBeforeSave)
  },
};
