import { translate } from '@leonardosarmentocastro/i18n';

export const sms2FAErrorCellphoneNumberAlreadyRegistered = (cellphoneNumber) => ({
  code: 'AUTHENTICATION_SMS_2FA_CELLPHONE_NUMBER_ALREADY_REGISTERED',
  cellphoneNumber,
});

export const sms2FACancelUnexpectedError = ({ errorText, requestId, status }) => ({
  code: 'AUTHENTICATION_SMS_2FA_CANCEL_UNEXPECTED_ERROR',
  errorText,
  requestId,
  status,
});

export const sms2FACheckUnexpectedError = ({
  errorText,
  pin,
  requestId,
  status,
}) => ({
  code: 'AUTHENTICATION_SMS_2FA_CHECK_UNEXPECTED_ERROR',
  errorText,
  pin,
  requestId,
  status,
});

export const sms2FAVerificationUnexpectedError = ({
  cellphoneNumber,
  errorText,
  requestId,
  status,
}) => ({
  code: 'AUTHENTICATION_SMS_2FA_VERIFICATION_UNEXPECTED_ERROR',
  cellphoneNumber,
  errorText,
  requestId,
  status,
});

export const translatedError = (req, res, { err, statusCode = 401 }) =>
  res.status(statusCode).json(
    translate.error(err, req.locale, {})
  );
