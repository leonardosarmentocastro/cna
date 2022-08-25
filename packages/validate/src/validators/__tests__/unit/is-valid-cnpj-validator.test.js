const test = require('ava');

const { isValidCnpjValidator } = require('../../is-valid-cnpj-validator');

test('validator must return "false" if cnpjs are not valid', t => {
  [
    '411407182',
    '11.111.111/1111-11',
  ].forEach(cnpj => {
    const doc = { cnpj };
    const isValid = isValidCnpjValidator('cnpj')(doc).validator();

    t.false(isValid);
  });
});

test('validator must return "true" if cnpjs are valid', t => {
  [
    '48192857000187',
    '03596384000145',
    '87.302.649/0001-45',
    '36.786.174/0001-79'
  ].forEach(cnpj => {
    const doc = { cnpj };
    const isValid = isValidCnpjValidator('cnpj')(doc).validator();

    t.true(isValid);
  });
});
