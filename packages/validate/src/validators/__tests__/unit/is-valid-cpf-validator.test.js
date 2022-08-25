const test = require('ava');

const { isValidCpfValidator } = require('../../is-valid-cpf-validator');

test('validator must return "false" if cpfs are not valid', t => {
  [
    '213.198.013-20',
    '2131201872781',
    '11111111111'
  ].forEach(cpf => {
    const doc = { cpf };
    const isValid = isValidCpfValidator('cpf')(doc).validator();

    t.false(isValid);
  });
});

test('validator must return "true" if cpfs are valid', t => {
  [
    '744.089.970-99',
    '788.782.669-14',
    '70346025060',
    '16907501970'
  ].forEach(cpf => {
    const doc = { cpf };
    const isValid = isValidCpfValidator('cpf')(doc).validator();

    t.true(isValid);
  });
});
