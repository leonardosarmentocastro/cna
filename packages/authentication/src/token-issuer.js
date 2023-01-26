import jwt from 'jsonwebtoken';

const DEFAULT = {
  options: {
    expiresIn: '7 days',
    issuer: '@leonardosarmentocastro/authentication',
  },
};

export const tokenIssuer = {
  sign: (authenticated = {}, options = DEFAULT.options) => jwt.sign(
    {
      payload: {}, // TODO: authenticated's "role"
    },
    process.env.AUTHENTICATION_SECRET,
    {
      expiresIn: options.expiresIn,
      issuer: options.issuer,
      subject: authenticated.id,
    },
  )
};
