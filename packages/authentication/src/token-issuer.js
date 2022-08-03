const jwt = require('jsonwebtoken');

exports.tokenIssuer = {
  sign: (authenticated = {}) => jwt.sign(
    {
      payload: {}, // TODO: authenticateds "role"
    },
    process.env.AUTHENTICATION_SECRET,
    {
      expiresIn: '7 days',
      issuer: '@leonardosarmentocastro/authentication',
      subject: authenticated.id,
    },
  )
};
