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
    console.debug('@@@ signInResolver')

    const constraints = [ ...[ 'cellphoneNumber', 'password' ].map(field => isRequiredValidator(field)) ];
    const err = await validate(constraints, req.body);
    console.debug('@@@ 1. err', err)
    if (err) throw { err, statusCode: 400 };

    const { cellphoneNumber, password } = req.body;
    console.debug('@@@ 2.0. cellphoneNumber, password', cellphoneNumber, password)
    const doc = await model.findOne({ 'authentication.cellphoneNumber': cellphoneNumber });
    console.debug('@@@ 2.1. doc', doc)
    if (!doc) throw { err: authenticationErrorCellphoneNumberNotFound(cellphoneNumber), statusCode: 404 };

    const hasMatched = await encrypter.verify(doc.authentication.password, password);
    console.debug('@@@ 3. hasMatched', hasMatched)
    if (!hasMatched) throw { err: authenticationErrorPasswordMismatch(password), statusCode: 404 };

    const transformedDoc = doc.toObject({ sensitive: true });
    console.debug('@@@ 3. transformedDoc', transformedDoc)
    req.signedInDoc = transformedDoc;
    next();
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
