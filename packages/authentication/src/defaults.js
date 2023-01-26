import Mongoose from 'mongoose';

import { authenticationSchema } from './schema.js';

const schema = new Mongoose.Schema({
  authentication: authenticationSchema,
  name: 'String',
});
schema.set('toObject', { virtuals: true });
export const TestingModel = new Mongoose.model('Authentication', schema);
export const DEFAULTS = { model: TestingModel };
