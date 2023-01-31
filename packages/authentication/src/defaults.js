import Mongoose from 'mongoose';
import { commonSchema, plugSchema, transform } from '@leonardosarmentocastro/database';

import { authenticationSchema } from './schema.js';

const schema = new Mongoose.Schema({
  authentication: authenticationSchema,
  name: 'String',
});
schema.set('toObject', {
  transform,
  virtuals: true,
});
schema.plugin(plugSchema(commonSchema));

export const TestingModel = new Mongoose.model('Authentication', schema);
export const DEFAULTS = { model: TestingModel };
