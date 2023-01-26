import test from 'ava';

import { encrypter } from '../../encrypter.js';

// Fixtures
const PASSWORDS = ['123456', 'p@ssw0rd', '+123abc321+'];

test('must be able to encrypt a string and validate against the corresponding uncrypted string', async t => {
  for (const password in PASSWORDS) {
    const hashedPassword = await encrypter.hash(password);

    t.assert(hashedPassword !== password);
    t.truthy(await encrypter.verify(hashedPassword, password));
  }
});

test('every new encryption must generate a different hashed output, while still matching the uncrypted value', async t => {
  for (const password in PASSWORDS) {
    const hashedPassword1 = await encrypter.hash(password);
    const hashedPassword2 = await encrypter.hash(password);

    t.assert(hashedPassword1 !== hashedPassword2);
    t.truthy(await encrypter.verify(hashedPassword1, password));
    t.truthy(await encrypter.verify(hashedPassword2, password));
  }
});

test('must be able to tell if a string is encrypted or not', async t => {
  for (const password in PASSWORDS) {
    const hashedPassword = await encrypter.hash(password);

    t.truthy(encrypter.isHashed(hashedPassword));
    t.falsy(encrypter.isHashed(password));
  }
});
