import { isRequiredValidator, validate } from '@leonardosarmentocastro/validate';

import { DEFAULTS } from '../defaults.js';
import { encrypter } from '../encrypter.js';
import {
  translatedError,
  authenticationErrorCellphoneNumberNotFound,
  authenticationErrorPasswordMismatch,
} from '../errors.js';

export const signInResolver = (model = DEFAULTS.model) => async (req, res, next) => {
  try {
    const constraints = [ ...[ 'cellphoneNumber', 'password' ].map(field => isRequiredValidator(field)) ];
    const err = await validate(constraints, req.body);
    if (err) throw { err, statusCode: 400 };

    const { cellphoneNumber, password } = req.body;
    const doc = await model.findOne({ 'authentication.cellphoneNumber': cellphoneNumber });
    if (!doc) throw { err: authenticationErrorCellphoneNumberNotFound(cellphoneNumber), statusCode: 404 };

    const hasMatched = await encrypter.verify(doc.authentication.password, password);
    if (!hasMatched) throw { err: authenticationErrorPasswordMismatch(password), statusCode: 404 };

    const transformedDoc = doc.toObject({ sensitive: true });
    req.signedInDoc = transformedDoc;
    next();
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
