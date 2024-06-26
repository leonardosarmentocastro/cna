const mongoose = require('mongoose');

// Middlewares
const preSaveMiddleware = function(next) {
  const schema = this;

  schema.updatedAt = schema.updatedAt ? Date.now() : schema.createdAt;

  schema.updatedAt_ptBR = new Date(schema.updatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  schema.createdAt_ptBR = new Date(schema.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

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
    type: Date,
    default: Date.now,
    required: true,
  },
  createdAt_ptBR: {
    type:String,
    default: '',
    required: false,
  },
  updatedAt: {
    type: Date,
    default: null,
    required: false,
  },
  updatedAt_ptBR: {
    type:String,
    default: '',
    required: false,
  },
});
commonSchema.pre('save', preSaveMiddleware);
commonSchema.set('toObject', { transform });
commonSchema.set('toJSON', {
  virtuals: true // Expose "id" instead of "_id".
});

// https://stackoverflow.com/a/54453990
// commonSchema.virtual('createdAt_ptBR').get(function() {
//   const doc = this;
//   return new Date(doc.createdAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
// });
// commonSchema.virtual('updatedAt_ptBR').get(function() {
//   const doc = this;
//   return new Date(doc.updatedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
// });

module.exports = {
  commonSchema,
  preSaveMiddleware,
  transform,
};
