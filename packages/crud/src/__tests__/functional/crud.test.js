const test = require('ava');
const mongoose = require('mongoose');
const got = require('got');
const server = require('@leonardosarmentocastro/server');
const i18n = require('@leonardosarmentocastro/i18n');
const { database } = require('@leonardosarmentocastro/database');
const { validate, isRequiredValidator } = require('@leonardosarmentocastro/validate');
const { paginationPlugin } = require('@leonardosarmentocastro/pagination');

const { crud } = require('../../crud');
const { ERROR_DOCUMENT_NOT_FOUND } = require('../../errors');
const PRODUCT1 = { name: 'product1' };

test.before('setup: start an api/connect to database', async t => {
  await database.connect();

  t.context.api = await server.start(8080, {
    middlewares: (app) => {
      i18n.connect(app);
    },
    routes: (app) => {
      const schema = new mongoose.Schema({ name: String });

      schema.post('validate', async (doc, next) => {
        const constraints = [ isRequiredValidator('name') ];
        const error = await validate(constraints, doc);

        return next(error);
      });
      schema.set('toObject', {
        transform: (doc, ret) => {
          const { __v, _id, ...fields } = ret;
          return fields;
        },
        virtuals: true // Expose "id" instead of "_id".
      });
      schema.plugin(paginationPlugin);

      const model = mongoose.model('NationalProduct', schema);
      crud.connect(app, model);
      t.context.model = model; // it's gonna be used on tests.
    },
  });
});

test.after.always('teardown: api/database', async t => {
  await server.close(t.context.api);
});

test('++++++++++++++++++++ success scenarios:', t => t.pass());

test('[C] must succeed on creating an entry for any given model (e.g. "POST /national-products")', async t => {
  const response = await got.post(`http://127.0.0.1:8080/national-products`, { json: PRODUCT1 });
  const body = JSON.parse(response.body);

  t.assert(response.statusCode === 200);
  t.notDeepEqual(body, {});
  t.is(body.name, PRODUCT1.name);
  t.truthy(body.id);
});

test('[R] must succeed on reading entries for any given model (e.g. "GET /national-products")', async t => {
  await t.context.model.deleteMany({});
  const product1 = (await t.context.model.create(PRODUCT1)).toObject();

  const response = await got(`http://127.0.0.1:8080/national-products`);
  const body = JSON.parse(response.body);

  t.assert(response.statusCode === 200);
  t.notDeepEqual(body, {});
  t.deepEqual(body, {
    docs: [ product1 ],
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: null,
    previousPage: null,
    totalCount: 1,
    totalPages: 1,
  });
});

test('[R] must succeed on reading an entry searching by its id (e.g. "GET /national-products/:id")', async t => {
  await t.context.model.deleteMany({});
  const product1 = (await t.context.model.create(PRODUCT1)).toObject();

  const response = await got(`http://127.0.0.1:8080/national-products/${product1.id}`);
  const body = JSON.parse(response.body);

  t.assert(response.statusCode === 200);
  t.notDeepEqual(body, {});
  t.deepEqual(body, product1);
});

test('[U] must succeed on updating an entry for any given model (e.g. "PUT /national-products/:id")', async t => {
  await t.context.model.deleteMany({});
  const product1 = (await t.context.model.create(PRODUCT1)).toObject();
  const payload = { name: 'product1::updated' };

  const response = await got.put(`http://127.0.0.1:8080/national-products/${product1.id}`, {
    json: payload,
  });
  const body = JSON.parse(response.body);

  t.assert(response.statusCode === 200);
  t.notDeepEqual(body, {});
  t.deepEqual(body, {
    id: product1.id,
    name: payload.name,
  });
});

test('[D] must succeed on deleting an entry for any given model (e.g. "DELETE /national-products/:id")', async t => {
  await t.context.model.deleteMany({});
  const product1 = (await t.context.model.create(PRODUCT1)).toObject();

  const doc1 = await t.context.model.findById(product1.id);
  t.deepEqual(doc1.toObject(), product1);

  const response = await got.delete(`http://127.0.0.1:8080/national-products/${product1.id}`);
  t.assert(response.statusCode === 200);
  t.is(response.body, '');

  const doc = await t.context.model.findById(product1.id);
  t.is(doc, null);
});

test('xxxxxxxxxxxxxxxxxxxx error scenarios:', t => t.pass());

test('[C] when failing to create an entry due to "schema validation", return a translated error', t => {
  const field = 'name';
  const payload = { [field]: '' };

  return got.post(`http://127.0.0.1:8080/national-products`, {
    json: payload,
    headers: { 'accept-language': 'pt-br' },
  }).catch(error => {
    const { validator, ...err } = isRequiredValidator(field)(payload);

    t.assert(error.response.statusCode == 500);
    t.deepEqual(JSON.parse(error.response.body), i18n.translate.error(err, 'pt-br', payload));
  });
});

// TODO: when constructing a "schema" for tests, inject a method that throws. Then, assert the translated unexpected error.
test.todo('[R] when failing to read registries for any unknown reason, return an translated unexpected error');

test('[R] when failing to read an entry due to "id is not a mongoid", return an translated error', async t => {
  await t.context.model.deleteMany({});
  const id = '0123456789';

  return got(`http://127.0.0.1:8080/national-products/${id}`, {
    headers: { 'accept-language': 'pt-br' },
  }).catch(error => {
    t.assert(error.response.statusCode == 500);
    t.deepEqual(JSON.parse(error.response.body), i18n.translate.error(ERROR_DOCUMENT_NOT_FOUND, 'pt-br', { id }));
  });
});

test('[R] when failing to read an entry due to "doc of ${id} not found", return an translated error', async t => {
  await t.context.model.deleteMany({});
  const id = new mongoose.Types.ObjectId();

  return got(`http://127.0.0.1:8080/national-products/${id}`, {
    headers: { 'accept-language': 'pt-br' },
  }).catch(error => {
    t.assert(error.response.statusCode == 500);
    t.deepEqual(JSON.parse(error.response.body), i18n.translate.error(ERROR_DOCUMENT_NOT_FOUND, 'pt-br', { id }));
  });
});

test('[U] when failing to update an entry due to "id is not a mongoid", return a translated error', async t => {
  await t.context.model.deleteMany({});
  const id = '0123456789';

  return got.put(`http://127.0.0.1:8080/national-products/${id}`, {
    headers: { 'accept-language': 'pt-br' },
  }).catch(error => {
    t.assert(error.response.statusCode == 500);
    t.deepEqual(JSON.parse(error.response.body), i18n.translate.error(ERROR_DOCUMENT_NOT_FOUND, 'pt-br', { id }));
  });
});

test('[U] when failing to update an entry due to "doc of ${id} not found", return a translated error', async t => {
  await t.context.model.deleteMany({});
  const id = new mongoose.Types.ObjectId();

  return got.put(`http://127.0.0.1:8080/national-products/${id}`, {
    headers: { 'accept-language': 'pt-br' },
  }).catch(error => {
    t.assert(error.response.statusCode == 500);
    t.deepEqual(JSON.parse(error.response.body), i18n.translate.error(ERROR_DOCUMENT_NOT_FOUND, 'pt-br', { id }));
  });
});

test('[U] when failing to update an entry due to "schema validation", return a translated error', async t => {
  await t.context.model.deleteMany({});
  const product1 = (await t.context.model.create(PRODUCT1)).toObject();

  const field = 'name';
  const payload = { [field]: '' }; // prop "name" is set as required on validation middleware
  return got.put(`http://127.0.0.1:8080/national-products/${product1.id}`, {
    headers: { 'accept-language': 'pt-br' },
    json: payload,
  }).catch(error => {
    const { validator, ...err } = isRequiredValidator(field)(payload);

    t.assert(error.response.statusCode == 500);
    t.deepEqual(JSON.parse(error.response.body), i18n.translate.error(err, 'pt-br', payload));
  });
});

test('[D] when failing to delete an entry due to "doc of ${id} not found", return a translated error', async t => {
  await t.context.model.deleteMany({});
  const id = new mongoose.Types.ObjectId();

  return got.put(`http://127.0.0.1:8080/national-products/${id}`, {
    headers: { 'accept-language': 'pt-br' },
  }).catch(error => {
    t.assert(error.response.statusCode == 500);
    t.deepEqual(JSON.parse(error.response.body), i18n.translate.error(ERROR_DOCUMENT_NOT_FOUND, 'pt-br', { id }));
  });
});

// TODO: when constructing a "schema" for tests, inject a method that throws. Then, assert the translated unexpected error.
test.todo('[D] when failing to delete registries for any unknown reason, return an translated unexpected error');
