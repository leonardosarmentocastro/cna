import { isRequiredValidator, validate } from '@leonardosarmentocastro/validate';

import { sms2FAErrorCellphoneNumberAlreadyRegistered, translatedError } from '../errors.js';
import { $sms } from '../sms.js';
import { SMS_2FA_MOCK } from '../__mocks__/index.js';
import { DEFAULTS } from '../../defaults.js';
import { isValidCellphoneNumberValidator } from '../../validators.js';

const sms = (process.env.NODE_ENV === 'test' ? SMS_2FA_MOCK : $sms({}));
export const sms2FAVerifyResolver = (model = DEFAULTS.model) => async (req, res) => {
  try {
    const constraints = [ isRequiredValidator('cellphoneNumber'), isValidCellphoneNumberValidator ];
    const err = await validate(constraints, req.body);
    console.debug('@@@ err', err)
    if (err) throw { err, statusCode: 400 };

    // DEBATABLE: This verification makes sense IF verification is used only for signing-up.
    // But it doensn't make sense if verification is used for both sign-up and sign-in.
    const { cellphoneNumber } = req.body;
    console.debug('@@@ cellphoneNumber', cellphoneNumber)
    const doc = await model.findOne({ 'authentication.cellphoneNumber': cellphoneNumber });
    console.debug('@@@ doc', doc)
    if (doc) throw { err: sms2FAErrorCellphoneNumberAlreadyRegistered(cellphoneNumber), statusCode: 409 };

    const requestId = await sms.verify(cellphoneNumber);
    console.debug('@@@ requestId', requestId)
    return res.status(200).json({ requestId });
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
