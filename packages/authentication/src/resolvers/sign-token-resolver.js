const { tokenIssuer } = require('../token-issuer');

const signTokenResolver = async (req, res) => {
  const authenticated = req.createdDoc || req.signedInDoc;
  const authenticationToken = tokenIssuer.sign(authenticated);
  res.set('Authorization', authenticationToken);

  res.end();
};

module.exports = { signTokenResolver };
