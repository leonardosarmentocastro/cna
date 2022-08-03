const test = require('ava');
const mongoose = require('mongoose');

const { database } = require('@leonardosarmentocastro/database');
const { paginationPlugin } = require('../../plugin');
const {
  PRODUCTS,
  PRODUCT1, PRODUCT2, PRODUCT3,
  PRODUCT4, PRODUCT5, PRODUCT6,
  PRODUCT7, PRODUCT8, PRODUCT9,
  PRODUCT10
} = require('../../__fixtures__');

// Setup
test.before('connect to database', t => database.connect());
test.before('create sample products model to work with on tests', t => {
  const schema = new mongoose.Schema({ name: String, price: Number });
  schema.plugin(paginationPlugin);
  schema.set('toObject', {
    // Wipe out MongoDB internal fields.
    transform: (doc, ret) => {
      const { __v, _id, ...fields } = ret;
      return fields;
    },
  });

  t.context.model = mongoose.model('Product', schema);
});
test.before('cleanup / sequentially creates registries on database', async t => {
  await t.context.model.deleteMany({});

  for (const product of PRODUCTS) {
    await t.context.model.create(product);
  }
});

// Tests
test('must return an interface containing: all docs (as json by default), props that tell if there is next/previous page and which is the number for each', async t => {
  const pagination = { conditions: {},  limit: 5,  page: 2, sort: { price: 'desc' } };
  const results = await t.context.model.paginate(pagination);

  t.deepEqual(results, {
    docs: [ PRODUCT5, PRODUCT4, PRODUCT3, PRODUCT2, PRODUCT1 ],
    hasNextPage: false,
    hasPreviousPage: true,
    nextPage: null,
    previousPage: 1,
    totalCount: 10,
    totalPages: 2,
  });
});

test('(results::docs) when "toJson" option is active, it must contain the results from pagination query as json objects', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };
  const options = { toJson: true };

  const results1 = await t.context.model.paginate(pagination, options);
  t.deepEqual(results1.docs, [ PRODUCT1, PRODUCT2, PRODUCT3 ]);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 }, options);
  t.deepEqual(results2.docs, [ PRODUCT4, PRODUCT5, PRODUCT6 ]);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 }, options);
  t.deepEqual(results3.docs, [ PRODUCT7, PRODUCT8, PRODUCT9 ]);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 }, options);
  t.deepEqual(results4.docs, [ PRODUCT10 ]);
});

test('(results::docs) when "toJson" option is disabled, it must contain the results from pagination query as mongoose models', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };
  const options = { toJson: false };

  const results1 = await t.context.model.paginate(pagination, options);
  const [ product1, product2, product3 ] = results1.docs;
  t.assert(product1 instanceof t.context.model);
  t.deepEqual(product1.toObject(), PRODUCT1);

  t.assert(product2 instanceof t.context.model);
  t.deepEqual(product2.toObject(), PRODUCT2);

  t.assert(product3 instanceof t.context.model);
  t.deepEqual(product3.toObject(), PRODUCT3);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 }, options);
  const [ product4, product5, product6 ] = results2.docs;
  t.assert(product4 instanceof t.context.model);
  t.deepEqual(product4.toObject(), PRODUCT4);

  t.assert(product5 instanceof t.context.model);
  t.deepEqual(product5.toObject(), PRODUCT5);

  t.assert(product6 instanceof t.context.model);
  t.deepEqual(product6.toObject(), PRODUCT6);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 }, options);
  const [ product7, product8, product9 ] = results3.docs;
  t.assert(product7 instanceof t.context.model);
  t.deepEqual(product7.toObject(), PRODUCT7);

  t.assert(product8 instanceof t.context.model);
  t.deepEqual(product8.toObject(), PRODUCT8);

  t.assert(product9 instanceof t.context.model);
  t.deepEqual(product9.toObject(), PRODUCT9);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 }, options);
  const [ product10 ] = results4.docs;
  t.assert(product10 instanceof t.context.model);
  t.deepEqual(product10.toObject(), PRODUCT10);
});

test('(results::docs) must return results that matches "conditions"', async t => {
  const conditions = { price: PRODUCT10.price };
  const pagination = { conditions,  limit: 3,  page: 1, sort: '' };

  const results = await t.context.model.paginate(pagination);
  t.deepEqual(results.docs, [ PRODUCT10 ]);
});

test('(results::docs) must return an empty array when query doesn\'t find results that matches "conditions"', async t => {
  const conditions = { name: '' };
  const pagination = { conditions,  limit: 3,  page: 1, sort: '' };

  const results = await t.context.model.paginate(pagination);
  t.deepEqual(results.docs, []);
});

test('(results::docs) must be able serve ascending sortened results', async t => {
  const sort = { name: 'asc', price: 'asc' };
  const pagination = { conditions: {},  limit: 3,  page: 1, sort };

  const results1 = await t.context.model.paginate(pagination);
  t.deepEqual(results1.docs, [ PRODUCT1, PRODUCT2, PRODUCT3 ]);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.deepEqual(results2.docs, [ PRODUCT4, PRODUCT5, PRODUCT6 ]);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.deepEqual(results3.docs, [ PRODUCT7, PRODUCT8, PRODUCT9 ]);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.deepEqual(results4.docs, [ PRODUCT10 ]);
});

test('(results::docs) must be able serve descending sortened results', async t => {
  const sort = { name: 'desc', price: 'desc' };
  const pagination = { conditions: {},  limit: 3,  page: 1, sort };

  const results1 = await t.context.model.paginate(pagination);
  t.deepEqual(results1.docs, [ PRODUCT10, PRODUCT9, PRODUCT8 ]);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.deepEqual(results2.docs, [ PRODUCT7, PRODUCT6, PRODUCT5 ]);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.deepEqual(results3.docs, [ PRODUCT4, PRODUCT3, PRODUCT2 ]);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.deepEqual(results4.docs, [ PRODUCT1 ]);
});

test('(results::hasNextPage) must be a boolean', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };

  const results1 = await t.context.model.paginate(pagination);
  t.truthy(results1.hasNextPage);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.truthy(results2.hasNextPage);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.truthy(results3.hasNextPage);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.falsy(results4.hasNextPage);
});

test('(results::hasPreviousPage) must be a boolean', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };

  const results1 = await t.context.model.paginate(pagination);
  t.falsy(results1.hasPreviousPage);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.truthy(results2.hasPreviousPage);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.truthy(results3.hasPreviousPage);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.truthy(results4.hasPreviousPage);
});

test('(results::nextPage) must be an integer number when there is a next page, and null when doesn\'t', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };

  const results1 = await t.context.model.paginate(pagination);
  t.assert(results1.nextPage === 2);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.assert(results2.nextPage === 3);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.assert(results3.nextPage === 4);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.assert(results4.nextPage === null);
});

test('(results::previousPage) must be an integer number when there is a previous page, and null when doesn\'t', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };

  const results1 = await t.context.model.paginate(pagination);
  t.assert(results1.previousPage === null);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.assert(results2.previousPage === 1);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.assert(results3.previousPage === 2);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.assert(results4.previousPage === 3);
});

test('(results::totalCount) must be an integer number regards to the number of results returned by running the query with "conditions", not considering "limit"', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };

  const results1 = await t.context.model.paginate(pagination);
  t.assert(results1.totalCount === 10);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.assert(results2.totalCount === 10);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.assert(results3.totalCount === 10);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.assert(results4.totalCount === 10);

  // Changing the condition
  const conditions = { name: PRODUCT1.name };
  const results5 = await t.context.model.paginate({ ...pagination, conditions });
  t.assert(results5.totalCount === 1);
});

test('(results::totalPages) must be an integer number regards to the result of dividing "totalCount" by "limit"', async t => {
  const pagination = { conditions: {},  limit: 3,  page: 1, sort: '' };

  const results1 = await t.context.model.paginate(pagination);
  t.assert(results1.totalPages === 4);

  const results2 = await t.context.model.paginate({ ...pagination, page: 2 });
  t.assert(results2.totalPages === 4);

  const results3 = await t.context.model.paginate({ ...pagination, page: 3 });
  t.assert(results3.totalPages === 4);

  const results4 = await t.context.model.paginate({ ...pagination, page: 4 });
  t.assert(results4.totalPages === 4);

  // Changing the condition
  const conditions = { name: PRODUCT1.name };
  const results5 = await t.context.model.paginate({ ...pagination, conditions });
  t.assert(results5.totalPages === 1);
});
