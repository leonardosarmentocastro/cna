import { tokenIssuer } from '../token-issuer.js';
import { DEFAULTS } from '../defaults.js';

export const signTokenResolver = (model = DEFAULTS.model) => async (req, res) => {
  console.debug('@@@ signTokenResolver')
  const authenticated = req.createdDoc || req.signedInDoc;
  const authenticationToken = tokenIssuer.sign(authenticated);

  console.debug('@@@ authenticationToken', authenticationToken)
  const foundDoc = await model.findById(authenticated.id);
  console.debug('@@@ foundDoc', foundDoc)
  foundDoc.authentication.tokens.push(authenticationToken);
  await foundDoc.save();
  console.debug('@@@ past:foundDoc.save')

  res.set('Authorization', `Bearer ${authenticationToken}`);
  res.set("Access-Control-Expose-Headers", "Authorization"); // https://stackoverflow.com/q/50570900 + https://stackoverflow.com/a/50570965 + https://stackoverflow.com/a/66291644
  res.end();
};
