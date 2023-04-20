const { paginationTranslatedValidationError } = require('./errors');
const { validate } = require('./validate');

const DEFAULT = {
  c: '{}', // conditions
  l: '10', // limit
  p: '1', // page
  s: '', // sort
};

const convertSuffix = (suffix) => {
  switch(suffix) {
    case '+': return 'asc';
    case '-': return 'desc';
    default: return 'desc';
  }
};

const mapSortingSuffix = (sort) => // "email+;username-;"
  sort.split(';')  // [ "email+", "username-", "" ]
    .filter(Boolean) //[ "email+", "username-" ]
    .reduce((accumulator, sorting) => { // "email+"
      const suffix = sorting.slice(-1); // "+"
      const key = sorting.substring(0, sorting.length - 1); // "email"

      return {
        ...accumulator,
        [key]: convertSuffix(suffix),
      };
    }, {});

const paginationMiddleware = (req, res, next) => {
  const queryParameters = { ...DEFAULT, ...req.query };
  const err = validate(queryParameters);
  if (err) return paginationTranslatedValidationError(req, res, { err });

  const { c, l, p, s } = queryParameters;
  req.pagination = {
    conditions: JSON.parse(c),
    limit: Number(l),
    page: Number(p),
    sort: mapSortingSuffix(s),
  };

  next();
}

module.exports = {
  DEFAULT,
  convertSuffix,
  mapSortingSuffix,
  paginationMiddleware,
};
