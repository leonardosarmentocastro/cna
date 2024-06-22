import jwt from 'jsonwebtoken';

const DEFAULT = {
  options: {
    expiresIn: '15 days',
    issuer: '@leonardosarmentocastro/authentication',
  },
};

export const tokenIssuer = {
  sign: (authenticated = {}, options = DEFAULT.options) => jwt.sign(
    {
      payload: { ...authenticated }, // TODO: FUNCTIONAL/UNIT TEST
      // payload: authenticated, // TODO: in case we want to share authenticated user data inside the token
    },
    process.env.AUTHENTICATION_SECRET,
    {
      expiresIn: options.expiresIn,
      issuer: options.issuer,
      subject: authenticated.id,
    },
  )
};
