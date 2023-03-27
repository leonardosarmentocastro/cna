import test from 'ava';
import { database } from '@leonardosarmentocastro/database';

import { TestingModel } from '../../defaults.js';
import { encrypter } from '../../encrypter.js';
import { tokenIssuer } from '../../token-issuer.js';
import { VALID_DOC } from '../../__fixtures__/index.js';
import { CELLPHONE_NUMBER_VALIDATION_REGEX } from '../../validators.js';

// Preparations
/////
const cleanUp = async t => {
  process.env.AUTHENTICATION_SECRET = undefined;
  await TestingModel.deleteMany({});
};

const getEntriesOnDatabase = () => TestingModel.find({});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Setup
/////
test.before(t => database.connect());
test.beforeEach(cleanUp);
test.afterEach(cleanUp);

// Tests
/////
test('model creation must succeeds when not requiring 2FA', async t => {
  const preparedModel = {
    ...VALID_DOC,
    authentication: {
      ...VALID_DOC.authentication,
      require2FA: false,
    },
  };

  t.assert((await getEntriesOnDatabase()).length === 0);
  const createdDoc = await new TestingModel(preparedModel).save();
  t.assert((await getEntriesOnDatabase()).length === 1);

  const {
    id,
    createdAt,
    updatedAt,
    ...rest
  } = createdDoc.toObject({ sensitive: false });

  const withoutPassword = (object) => JSON.parse(JSON.stringify({
    ...object,
    authentication: {
      ...object.authentication,
      password: undefined,
    },
  }))
  const actualDoc = withoutPassword(rest);
  const expectedDoc = withoutPassword(preparedModel);
  t.deepEqual(actualDoc, expectedDoc);
});

test('model creation must succeeds when not requiring strong password', async t => {
  const preparedModel = {
    ...VALID_DOC,
    authentication: {
      ...VALID_DOC.authentication,
      password: 'weak',
      requireStrongPassword: false,
    },
  };

  t.assert((await getEntriesOnDatabase()).length === 0);
  const createdDoc = await new TestingModel(preparedModel).save();
  t.assert((await getEntriesOnDatabase()).length === 1);

  const {
    id,
    createdAt,
    updatedAt,
    ...rest
  } = createdDoc.toObject({ sensitive: false });

  const withoutPassword = (object) => JSON.parse(JSON.stringify({
    ...object,
    authentication: {
      ...object.authentication,
      password: undefined,
    },
  }))
  const actualDoc = withoutPassword(rest);
  const expectedDoc = withoutPassword(preparedModel);
  t.deepEqual(actualDoc, expectedDoc);
});

[
  'cellphoneNumber',
  'password',
].map(field => test(`model creation must fail due to lack of required field "${field}"`, async t => {
  t.assert((await getEntriesOnDatabase()).length === 0);

  try {
    const doc = {
      ...VALID_DOC,
      authentication: {
        ...VALID_DOC.authentication,
        [field]: undefined,
      },
    };

    await new TestingModel(doc).save();
  } catch(err) {
    t.deepEqual(err.errors.authentication, {
      code: 'VALIDATOR_ERROR_FIELD_IS_REQUIRED',
      field,
    });
  }

  t.assert((await getEntriesOnDatabase()).length === 0);
}));

// [
//   'cellphoneNumber',
// ].map(field => test(`model creation must fail due to field "${field}" being already used`, async t => {
//   t.assert((await getEntriesOnDatabase()).length === 0);
//   await new TestingModel(VALID_DOC).save();
//   t.assert((await getEntriesOnDatabase()).length === 1);

//   await new TestingModel({
//     ...VALID_DOC,
//     [field]: VALID_DOC[field],
//   })
//   .save()
//   .catch(err => t.deepEqual(err, {
//     code: 'VALIDATOR_ERROR_FIELD_IS_ALREADY_IN_USE',
//     field,
//   }));

//   t.assert((await getEntriesOnDatabase()).length === 1);
// }));

[
  '11999991111', // missing country code
  '55999991111', // missing DDD
  '999991111', // missing country code and DDD
  '55 11) 99999 1111', // missing "("
  '55 (11 99999 1111', // missing ")"
  '55 (11) 99999 1111', // only numbers are allowed
  '55 (11) 99999-1111', // only numbers are allowed
].map(cellphoneNumber =>
  test(`model creation must fail if "cellphoneNumber" is not valid (e.g. ${cellphoneNumber})`, async t => {
    t.assert((await getEntriesOnDatabase()).length === 0);

    try {
      const doc = {
        ...VALID_DOC,
        authentication: {
          ...VALID_DOC.authentication,
          cellphoneNumber,
        },
      };

      await new TestingModel(doc).save();
    } catch(err) {
      t.deepEqual(err.errors.authentication, {
        code: 'AUTHENTICATION_VALIDATOR_ERROR_INVALID_CELLPHONE_NUMBER',
        field: 'cellphoneNumber',
        value: cellphoneNumber,
        CELLPHONE_NUMBER_VALIDATION_REGEX: CELLPHONE_NUMBER_VALIDATION_REGEX.toString(),
      });
    }

    t.assert((await getEntriesOnDatabase()).length === 0);
  })
);

[
  '12345678',
  '12345abc',
  '12345abC',
].map(password =>
  test(`model creation must fail if "password" is weak (e.g. ${password})`, async t => {
    t.assert((await getEntriesOnDatabase()).length === 0);

    try {
      const doc = {
        ...VALID_DOC,
        authentication: {
          ...VALID_DOC.authentication,
          requireStrongPassword: true,
          password,
        },
      };

      await new TestingModel(doc).save();
    } catch(err) {
      const { analysis, ...error } = err.errors.authentication;

      t.truthy(analysis.feedback);
      t.truthy(typeof analysis.score === 'number');
      t.deepEqual(error, {
        code: 'VALIDATOR_ERROR_PASSWORD_NOT_STRONG',
        field: 'password',
      });
    }

    t.assert((await getEntriesOnDatabase()).length === 0);
  })
);

test('when saving, must hash the password if still not hashed', async t => {
  const unhashedPassword = VALID_DOC.authentication.password;

  t.assert((await getEntriesOnDatabase()).length === 0);
  const createdDoc = await new TestingModel(VALID_DOC).save();
  const transformedDoc = createdDoc.toObject({ sensitive: false });
  t.assert((await getEntriesOnDatabase()).length === 1);

  t.assert(transformedDoc.authentication.password !== unhashedPassword); // now it must be hashed
  t.assert(await encrypter.verify(transformedDoc.authentication.password, unhashedPassword)); // while still matching the unhashed value
});


test('when saving, must not hash the password again if already hashed', async t => {
  const unhashedPassword = VALID_DOC.authentication.password;
  const hashedPassword = await encrypter.hash(unhashedPassword);

  t.assert((await getEntriesOnDatabase()).length === 0);
  const createdDoc = await new TestingModel({
    ...VALID_DOC,
    authentication: {
      ...VALID_DOC.authentication,
      password: hashedPassword,
    },
  }).save();
  const transformedDoc = createdDoc.toObject({ sensitive: false });
  t.assert((await getEntriesOnDatabase()).length === 1);

  t.assert(transformedDoc.authentication.password === hashedPassword); // now it must be hashed
  t.assert(await encrypter.verify(transformedDoc.authentication.password, unhashedPassword)); // while still matching the unhashed value
});

test('invalid "token" must not be considered on model saving', async t => {
  t.assert((await getEntriesOnDatabase()).length === 0);

  process.env.AUTHENTICATION_SECRET = 'authentication token secret';
  const user = { id: '123' };
  const authenticationTokens = {
    valid: tokenIssuer.sign(user, { expiresIn: '1 week', issuer: 'tests' }),
    invalid: tokenIssuer.sign(user, { expiresIn: '1 second', issuer: 'tests' }),
  };
  await sleep(2000);

  const doc = {
    ...VALID_DOC,
    authentication: {
      ...VALID_DOC.authentication,
      tokens: [ authenticationTokens.invalid, authenticationTokens.valid ],
    },
  };

  const createdDoc = await new TestingModel(doc).save();
  const transformedDoc = createdDoc.toObject();
  t.assert(transformedDoc.authentication.tokens.length === 1);
  t.deepEqual(transformedDoc.authentication.tokens, [ authenticationTokens.valid ]);
  t.assert((await getEntriesOnDatabase()).length === 1);
});

['tokens', 'password'].map(field =>
  test(`(transform) must hide property "${field}" when transforming doc to json object using "sensitive" option`, async t => {
    t.assert((await getEntriesOnDatabase()).length === 0);
    const createdDoc = await new TestingModel(VALID_DOC).save();
    t.assert((await getEntriesOnDatabase()).length === 1);

    const sensitiveDoc = createdDoc.toObject({ sensitive: true });
    t.falsy(sensitiveDoc.authentication[field]);

    const unsensitiveDoc = createdDoc.toObject({ sensitive: false });
    t.truthy(unsensitiveDoc.authentication[field]);
  })
);
