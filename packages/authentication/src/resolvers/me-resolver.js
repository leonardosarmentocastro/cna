import { DEFAULTS } from '../defaults.js';
import {
  authenticationErrorRegistryForTokenNotFound,
  translatedError,
} from '../errors.js';

export const meResolver = (model = DEFAULTS.model) => async (req, res, next) => {
  const id = req.authentication.subject;
  req.authentication.doc = await model.findById(id);

  const noRegistryFound = !req.authentication.doc;
  const noTokenFound = !req.authentication.doc?.authentication.tokens.some(token => token === req.authentication.token);
  if (noRegistryFound || noTokenFound) return translatedError(req, res, {
    err: authenticationErrorRegistryForTokenNotFound(req.authentication.token),
    statusCode: 404,
  });

  next();
};

export const serveMeResolver = (req, res) => {
  const transformedDoc = req.authentication.doc.toObject({ sensitive: true });
  return res.status(200).json(transformedDoc);
};
