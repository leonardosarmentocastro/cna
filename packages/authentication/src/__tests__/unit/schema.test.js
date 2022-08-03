const test = require('ava');

const { preSaveMiddleware } = require('../../schema');
const { encrypter } = require('../../encrypter');

test('(preSaveMiddleware) must hash the password if still not hashed', async t => {
  const unhashedPassword = 'not hashed password';

  const next = () => null;
  const schema = { password: unhashedPassword };
  await preSaveMiddleware.call(schema, next);

  t.assert(schema.password !== unhashedPassword); // now it must be hashed
  t.truthy(await encrypter.verify(schema.password, unhashedPassword)); // while still matching the unhashed value
});

test('(preSaveMiddleware) must not hash the password again if already hashed', async t => {
  const hashedPassword = await encrypter.hash('hashed password');

  const next = () => null;
  const schema = { password: hashedPassword };
  await preSaveMiddleware.call(schema, next);

  t.assert(schema.password === hashedPassword); // must not be mutated
  t.truthy(await encrypter.verify(schema.password, 'hashed password')); // and still matches the old value
});
