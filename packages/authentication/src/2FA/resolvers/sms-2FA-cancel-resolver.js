import { isRequiredValidator, validate } from '@leonardosarmentocastro/validate';

import { translatedError } from '../errors.js';
import { smsVerification } from '../sms-verification.js';

export const sms2FACancelResolver = async (req, res) => {
  try {
    const constraints = [ isRequiredValidator('requestId') ];
    const err = await validate(constraints, req.body);
    if (err) throw { err, statusCode: 400 };

    const { requestId } = req.body;
    await smsVerification.cancel(requestId);

    return res.status(200).end();
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
