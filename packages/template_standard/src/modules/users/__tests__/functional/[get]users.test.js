import test from 'ava';
import theOwl from 'the-owl';
import got from 'got';

import { database } from '@leonardosarmentocastro/database';
import {
  closeApiOpenedOnRandomPort,
  getRequestOptions,
  startApiOnRandomPort
} from '../../../../__helpers__/index.js';
import { UsersModel } from '../../model.js';
import { validPrefixedUserFixture } from '../__fixtures__/index.js';

// Setup
test.before('prepare: start api / connect to database', async t => {
  t.context.endpointOriginalPath = '/users';

  await startApiOnRandomPort(t);
  await database.connect();
});
test.beforeEach('cleanup database', t => UsersModel.deleteMany());
test.after('create api docs (if enabled)', t => theOwl.createDocs());
test.after.always('teardown', t => closeApiOpenedOnRandomPort(t));

// Tests
test('(200) must return paginated content if there are users from database', async t => {
  const users = [];
  for (const index of [ 1, 2, 3, 4 ]) {
    const user = validPrefixedUserFixture(`user${index}`);
    const createdUser = await UsersModel.create(user);
    const transformedUser = createdUser.toObject();

    users.push(transformedUser);
  }

  const url1 = `${t.context.endpointBaseUrl}?l=2&p=1`;
  const response1 = await got(url1, getRequestOptions(t));
  t.assert(response1.statusCode === 200);
  t.deepEqual(response1.body, {
    docs: [ users[0], users[1] ],
    hasNextPage: true,
    hasPreviousPage: false,
    nextPage: 2,
    previousPage: null,
    totalCount: 4,
    totalPages: 2,
  });

  const url2 = `${t.context.endpointBaseUrl}?l=2&p=2`;
  const response2 = await got(url2, getRequestOptions(t));
  t.assert(response2.statusCode === 200);
  t.deepEqual(response2.body, {
    docs: [ users[2], users[3] ],
    hasNextPage: false,
    hasPreviousPage: true,
    nextPage: null,
    previousPage: 1,
    totalCount: 4,
    totalPages: 2,
  });
});

test('(200) must return an empty array if there are no users on database', async t => {
  await UsersModel.deleteMany();

  // NOTE: Query parameters for pagination are optional. Default values are assigned on their absence.
  const response = await got(t.context.endpointBaseUrl, getRequestOptions(t));
  t.assert(response.statusCode === 200);
  t.deepEqual(response.body, {
    docs: [],
    hasNextPage: false,
    hasPreviousPage: false,
    nextPage: null,
    previousPage: null,
    totalCount: 0,
    totalPages: 0,
  });
});
