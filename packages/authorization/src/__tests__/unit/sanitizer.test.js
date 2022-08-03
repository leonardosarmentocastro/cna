const test = require('ava');

const { DEFAULT_OPTIONS, ROUTES_FOR_OPTION } = require('../../constants');
const { authorizationSanitizer, mergeOptions } = require('../../sanitizer');

const defaultOptionsKeys = Object.keys(DEFAULT_OPTIONS);
test('(mergeOptions) must give precedence to "option" input rather than "default options"', t => {
  defaultOptionsKeys
    .forEach(optionKey => {
      const { [optionKey]: defaultValue } = DEFAULT_OPTIONS;
      const precedenceValue = !defaultValue;
      const mergedOptions = mergeOptions({ [optionKey]: precedenceValue });

      t.truthy(
        mergedOptions.some(([ key, value ]) =>
          key === optionKey
          && value === precedenceValue
        )
      );
    });
});

test('(mergeOptions) must disconsider options that are not listed with default values', t => {
  defaultOptionsKeys
    .map(optionKey => `not-${optionKey}`)
    .forEach(notDefaultOptionKey => {
      const mergedOptions = mergeOptions({ [notDefaultOptionKey]: true });

      t.falsy(
        mergedOptions.some(([ key ]) => key === notDefaultOptionKey) // there must not be any sight of "not default key"
      );
      t.truthy(
        mergedOptions.every(([ key ]) => defaultOptionsKeys.includes(key)) // although all default keys must be still included
      );
    });
});

const markDefaultOptionsAs = (isAllowed) =>
  defaultOptionsKeys.reduce((acc, key) => ({ ...acc, [key]: isAllowed }), {});
test('(authorizationSanitizer) must include all routes related to option marked as allowed, while preserving inputed "allowedRoutes"', t => {
  const allowedRoutes = [{ method: 'put' , url: '/edit' }, { method: 'get', url: '/resource' }];

  const options1 = markDefaultOptionsAs(true);
  const routesToAllow1 = authorizationSanitizer(allowedRoutes, options1)
  t.deepEqual(routesToAllow1, [
    ...allowedRoutes,
    ...(Object.values(ROUTES_FOR_OPTION).flat())
  ]);

  const options2 = markDefaultOptionsAs(false);
  const routesToAllow2 = authorizationSanitizer(allowedRoutes, options2);
  t.deepEqual(routesToAllow2, [ ...allowedRoutes ]);

  const lastOptionKey = defaultOptionsKeys.slice(-1);
  const options3 = { ...markDefaultOptionsAs(false), [lastOptionKey]: true };
  const routesToAllow3 = authorizationSanitizer(allowedRoutes, options3);
  t.deepEqual(routesToAllow3, [
    ...allowedRoutes,
    ...ROUTES_FOR_OPTION[lastOptionKey],
  ]);
});
