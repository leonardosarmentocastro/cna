module.exports = {
  ...require('./is-already-in-use-validator'),
  ...require('./is-password-strong-validator'),
  ...require('./is-required-validator'),
  ...require('./is-too-long-validator'),
  ...require('./is-valid-cnpj-validator'),
  ...require('./is-valid-cpf-validator'),
  ...require('./is-valid-email-validator'),
};
