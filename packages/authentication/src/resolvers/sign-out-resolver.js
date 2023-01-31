import { translatedError } from '../errors.js';

export const signOutResolver = async (req, res) => {
  try {
    const doc = req.authentication.doc;
    const authenticationToken = req.authentication.token;

    const newTokens = doc.authentication.tokens.filter(token => token !== authenticationToken);
    doc.authentication.tokens = newTokens;
    await doc.save();

    res.removeHeader('Authorization');
    return res.status(200).end();
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
