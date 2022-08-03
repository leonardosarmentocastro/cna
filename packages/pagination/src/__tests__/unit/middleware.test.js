const test = require('ava');

const {
  DEFAULT,
  convertSuffix,
  mapSortingSuffix,
  paginationMiddleware,
} = require('../../middleware');
const { translate } = require('@leonardosarmentocastro/i18n');

test('(convertSuffix) must convert "+" to "asc"', t => {
  t.assert(convertSuffix('+') === 'asc');
});

test('(convertSuffix) must convert "-" to "desc"', t => {
  t.assert(convertSuffix('+') === 'asc');
});

test('(convertSuffix) must convert by default to "desc"', t => {
  t.assert(convertSuffix('*') === 'desc');
  t.assert(convertSuffix('anything else') === 'desc');
});

test('(mapSortingSuffix) must map "sort" query param to an key/value object', t => {
  const sort = 'email+;username-;';

  t.deepEqual(mapSortingSuffix(sort), {
    email: 'asc',
    username: 'desc',
  });
});

test('(paginationMiddleware) must return a translated pagination error on validation failure', t => {
  const req = {
    locale: 'en-us',
    query: { c: 'invalid value' },
  };
  const res = {
    status: () => ({
      json: (error) => error,
    }),
  };
  const next = () => null;

  const error = paginationMiddleware(req, res, next);
  t.deepEqual(error, translate.error(error, req.locale, {}));
});

test('(paginationMiddleware) must attach query parameters with proper types and whole names to "req.pagination"', t => {
  const req = { query: DEFAULT };
  const res = {};
  const next = () => null;

  paginationMiddleware(req, res, next);
  t.deepEqual(req, {
    pagination: {
      conditions: JSON.parse(DEFAULT.c),
      limit: Number(DEFAULT.l),
      page: Number(DEFAULT.p),
      sort: {},
    },
    query: DEFAULT,
  });
});
