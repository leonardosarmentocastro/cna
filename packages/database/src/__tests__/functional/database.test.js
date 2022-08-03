const test = require('ava');
const mongoose = require('mongoose');

const { database } = require('../../database');

test.before('create sample "products model" to work with on tests', t => {
  const schema = new mongoose.Schema({ name: String, price: Number });
  t.context.model = mongoose.model('Product', schema);
});

test('connection is stablishable', async t => {
  await t.notThrowsAsync(database.connect());
});

test('database operations can be performed after successful connection stablishment', async t => {
  await database.connect();

  await t.context.model.deleteMany({});

  const PRODUCT1 = { name: 'Beans', price: 1 };
  const PRODUCT2 = { name: 'Blueberry', price: 2 };
  const PRODUCT3 = { name: 'Bread', price: 3 };
  const PRODUCTS = [ PRODUCT1, PRODUCT2, PRODUCT3 ];
  for (const product of PRODUCTS) {
    await t.context.model.create(product);
  }

  const products = await t.context.model.find({});
  t.assert(products.length === 3);
});

test.todo('retry to connect up to 5 times');
