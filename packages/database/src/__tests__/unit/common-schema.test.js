const dayjs = require('dayjs');
const test = require('ava');

const { preSaveMiddleware, transform } = require('../../common-schema');

test('[preSaveMiddleware] must set the same value of "createdAt" to "updateAt" on document creation', async t => {
  const next = () => null;
  const now = dayjs().toISOString();
  const schema = { createdAt: now, updatedAt: null };

  preSaveMiddleware.call(schema, next);
  t.assert(schema.updatedAt == now);
});

test('[preSaveMiddleware] must set a new value to "updatedAt" field', async t => {
  const next = () => null;
  const oneDayAgo = dayjs().subtract(1, 'day').toISOString();
  const schema = { updatedAt: dayjs(oneDayAgo) };

  preSaveMiddleware.call(schema, next);
  t.assert(schema.updatedAt !== oneDayAgo);
});

test('(transform) must strip "__v" and "_id" from doc', t => {
  const fieldsNotToBeStripped = {
    id: '123',
    email: 'email@domain.com',
    username: 'username'
  };

  const doc = {}; // The mongoose document which is being converted
  const ret = { // The plain object representation which has been converted
    ...fieldsNotToBeStripped,

    __v: 0,
    _id: 'must be stripped',
  };

  t.deepEqual(transform(doc, ret), fieldsNotToBeStripped);
});
