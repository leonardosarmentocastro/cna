import { isRequiredValidator, validate } from '@leonardosarmentocastro/validate';

import { sms2FAErrorCellphoneNumberAlreadyRegistered, translatedError } from '../errors.js';
import { smsVerification } from '../sms-verification.js';
import { DEFAULTS } from '../../defaults.js';
import { isValidCellphoneNumberValidator } from '../../validators.js';

export const sms2FAVerifyResolver = (model = DEFAULTS.model) => async (req, res) => {
  try {
    const constraints = [ isRequiredValidator('cellphoneNumber'), isValidCellphoneNumberValidator ];
    const err = await validate(constraints, req.body);
    console.debug('@@@ err', err) // TODO: REMOVE IT
    if (err) throw { err, statusCode: 400 };

    // DEBATABLE: This verification makes sense IF verification is used only for signing-up.
    // But it doensn't make sense if verification is used for both sign-up and sign-in.
    const { cellphoneNumber } = req.body;
    console.debug('@@@ cellphoneNumber', cellphoneNumber) // TODO: REMOVE IT
    const doc = await model.findOne({ 'authentication.cellphoneNumber': cellphoneNumber });
    console.debug('@@@ doc', doc) // TODO: REMOVE IT
    if (doc) throw { err: sms2FAErrorCellphoneNumberAlreadyRegistered(cellphoneNumber), statusCode: 409 };

    const requestId = await smsVerification.start(cellphoneNumber);
    console.debug('@@@ requestId', requestId) // TODO: REMOVE IT
    return res.status(200).json({ requestId });
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
