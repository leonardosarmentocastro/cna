const mongoose = require('mongoose');

exports.DEFAULTS = {
  model: mongoose.model('CrudModel', new mongoose.Schema({ example: Boolean })),
};
