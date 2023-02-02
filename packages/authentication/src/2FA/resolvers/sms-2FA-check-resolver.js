import { isRequiredValidator, validate } from '@leonardosarmentocastro/validate';

import { translatedError } from '../errors.js';
import { smsVerification } from '../sms-verification.js';

export const sms2FACheckResolver = async (req, res) => {
  try {
    const constraints = [ ...[ 'requestId', 'pin' ].map(field => isRequiredValidator(field)) ];
    const err = await validate(constraints, req.body);
    if (err) throw { err, statusCode: 400 };

    const { requestId, pin } = req.body;
    await smsVerification.check(requestId, pin);

    return res.status(200).end();
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
