const mongoose = require('mongoose');

const { authenticationSchema } = require('./schema');
const { plugSchema } = require('@leonardosarmentocastro/database');

const schema = new mongoose.Schema({ text: String });
schema.set('toObject', { virtuals: true });
schema.plugin(plugSchema(authenticationSchema));

const model = new mongoose.model('Authentication', schema);

exports.DEFAULTS = { model };
