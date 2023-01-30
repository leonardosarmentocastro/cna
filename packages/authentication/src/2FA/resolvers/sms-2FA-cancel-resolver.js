import { isRequiredValidator, validate } from '@leonardosarmentocastro/validate';

import { translatedError } from '../errors.js';
import { $sms } from '../sms.js';
import { SMS_2FA_MOCK } from '../__mocks__/index.js';

const sms = (process.env.NODE_ENV === 'test' ? SMS_2FA_MOCK : $sms({}));
export const sms2FACancelResolver = async (req, res) => {
  try {
    const constraints = [ isRequiredValidator('requestId') ];
    const err = await validate(constraints, req.body);
    if (err) throw { err, statusCode: 400 };

    const { requestId } = req.body;
    await sms.cancel(requestId);

    return res.status(200).end();
  } catch ({ err, statusCode }) {
    return translatedError(req, res, { err, statusCode });
  }
};
