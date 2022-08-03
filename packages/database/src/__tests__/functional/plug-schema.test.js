const mongoose = require('mongoose');
const test = require('ava');

const { database } = require('../../database');
const { commonSchema } = require('../../common-schema');
const { plugSchema } = require('../../plug-schema');

test.before('setup database and test model', async t => {
  await database.connect();

  const schema = new mongoose.Schema({ text: String });
  schema.set('toObject', { virtuals: true });
  schema.plugin(plugSchema(commonSchema));
  t.context.model = new mongoose.model('Model', schema);
});

test('must inherit "toObject.transform" operations from plugged schema (e.g. commonsSchema)', async t => {
  const doc = await t.context.model.create({ text: 'any' });
  const transformedDoc = doc.toObject();

  t.falsy(transformedDoc._id);
  t.falsy(transformedDoc.__v);
});

test('must inherit "fields" from plugged schema (e.g. commonsSchema)', async t => {
  const doc = await t.context.model.create({ text: 'any text' });
  const transformedDoc = doc.toObject();

  t.truthy(transformedDoc.createdAt);
  t.truthy(transformedDoc.updatedAt);
});

test('must inherit "toObject.virtuals" from plugged schema (e.g. commonsSchema)', async t => {
  const doc = await t.context.model.create({ text: 'any text' });
  const transformedDoc = doc.toObject();

  t.truthy(transformedDoc.id);
});
