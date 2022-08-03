const test = require('ava');
const got = require('got');

const { database } = require('@leonardosarmentocastro/database');
const { ROUTES_FOR_OPTION } = require('../../constants');
const { AUTHORIZATION_ERROR_INVALID_TOKEN } = require('../../errors');
const { translate } = require('@leonardosarmentocastro/i18n');
const {
  closeApiOpenedOnRandomPort,
  getRequestOptions,
  startApiOnRandomPort,
  LOCALE,
} = require('../../../../__helpers__');

// Setup
test.before('prepare: start api / connect to database', async t => {
  await startApiOnRandomPort(t);
  await database.connect();
});
test.before('setup fixtures', t => {
  t.context.VALID_TOKEN = process.env.AUTHORIZATION_TOKEN;
  const INVALID_TOKENS = [ 'invalid-token', 'Bearer 123', 'Bearer', '123', '' ];
  const TOKENS = [ t.context.VALID_TOKEN, ...INVALID_TOKENS ];

  // Map all combinations of "routes x tokens".
  t.context.PRIVATE_ROUTES = [{ method: 'get', url: '/users' }];
  t.context.PRIVATE_ROUTES_WITH_INVALID_TOKENS = t.context.PRIVATE_ROUTES
    .reduce((accumulator, privateRoute) => {
      const privateRoutes = INVALID_TOKENS.map(token => ({ ...privateRoute, token }));
      return [ ...accumulator, ...privateRoutes ];
    }, []);
  t.context.PUBLIC_ROUTES = Object.values(ROUTES_FOR_OPTION).flat();
  t.context.PUBLIC_ROUTES_WITH_TOKENS = t.context.PUBLIC_ROUTES
    .filter(({ url }) => !!url) // Removes CORS check
    .filter(({ url }) => url.indexOf('authentication') !== 1) // Remove authentication routes
    .reduce((accumulator, publicRoute) => {
      const publicRoutes = TOKENS.map(token => ({ ...publicRoute, token }));
      return [ ...accumulator, ...publicRoutes ];
    }, []);

});
test.after.always('teardown', t => closeApiOpenedOnRandomPort(t));

test('must authorize when accessing "public routes" with/without a "valid authorization token"', async t => {
  const options = getRequestOptions(t);
  for (const { method, url, token } of t.context.PUBLIC_ROUTES_WITH_TOKENS) {
    options.headers['Authorization'] = token;

    const response = await got[method](`${t.context.endpointBaseUrl}${url}`, options);
    t.assert(response.statusCode === 200);
  }
});

test('must authorize when accessing "private routes" with a "valid authorization token"', async t => {
  const options = getRequestOptions(t);
  for (const { method, url } of t.context.PRIVATE_ROUTES) {
    options.headers['Authorization'] = t.context.VALID_TOKEN;

    const response = await got[method](`${t.context.endpointBaseUrl}${url}`, options);
    t.assert(response.statusCode === 200);
  }
});

test('must unauthorize when accessing "private routes" with an "invalid authorization token"', async t => {
  const options = getRequestOptions(t);
  for (const { method, url, token } of t.context.PRIVATE_ROUTES_WITH_INVALID_TOKENS) {
    options.headers['Authorization'] = token;

    await got[method](`${t.context.endpointBaseUrl}${url}`, options)
      .catch(err => {
        t.assert(err.response.statusCode === 401);
        t.deepEqual(err.response.body, translate.error(AUTHORIZATION_ERROR_INVALID_TOKEN, LOCALE, {}));
      });
  }
});
