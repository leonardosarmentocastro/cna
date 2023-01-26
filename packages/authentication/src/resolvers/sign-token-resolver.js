import { tokenIssuer } from '../token-issuer.js';

export const signTokenResolver = async (req, res) => {
  const authenticated = req.createdDoc || req.signedInDoc;
  const authenticationToken = tokenIssuer.sign(authenticated);
  res.set('Authorization', authenticationToken);

  res.end();
};
