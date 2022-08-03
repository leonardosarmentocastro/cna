const dayjs = require('dayjs');
const mongoose = require('mongoose');

// Middlewares
const preSaveMiddleware = function(next) {
  const schema = this;
  schema.updatedAt = schema.updatedAt ? dayjs().toISOString() : schema.createdAt;

  next();
};

// Virtuals - https://mongoosejs.com/docs/api.html#document_Document-toObject
const transform = (doc, ret) => {
  const {
    __v, _id, // MongoDB default
    ...fields
  } = ret;

  return fields;
};

// Schema definitions
const commonSchema = new mongoose.Schema({
  _id: false,
  createdAt: {
    type: String,
    default: dayjs().toISOString(),
    required: true,
  },
  updatedAt: {
    type: String,
    default: '',
  },
});
commonSchema.pre('save', preSaveMiddleware);
commonSchema.set('toObject', { transform });

module.exports = {
  commonSchema,
  preSaveMiddleware,
  transform,
};
