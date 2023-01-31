import { tokenIssuer } from '../token-issuer.js';
import { DEFAULTS } from '../defaults.js';

export const signTokenResolver = (model = DEFAULTS.model) => async (req, res) => {
  const authenticated = req.createdDoc || req.signedInDoc;
  const authenticationToken = tokenIssuer.sign(authenticated);

  const foundDoc = await model.findById(authenticated.id);
  foundDoc.authentication.tokens.push(authenticationToken);
  await foundDoc.save();

  res.set('Authorization', `Bearer ${authenticationToken}`);
  res.end();
};
