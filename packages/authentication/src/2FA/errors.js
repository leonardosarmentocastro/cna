import { translate } from '@leonardosarmentocastro/i18n';

export const sms2FAErrorCellphoneNumberAlreadyRegistered = (cellphoneNumber) => ({
  code: 'AUTHENTICATION_SMS_2FA_CELLPHONE_NUMBER_ALREADY_REGISTERED',
  cellphoneNumber,
});

export const sms2FACancelUnexpectedError = ({ requestId, stacktrace }) => ({
  code: 'AUTHENTICATION_SMS_2FA_CANCEL_UNEXPECTED_ERROR',
  requestId,
  stacktrace,
});

export const sms2FACheckUnexpectedError = ({ requestId, pid, stacktrace }) => ({
  code: 'AUTHENTICATION_SMS_2FA_CHECK_UNEXPECTED_ERROR',
  pid,
  requestId,
  stacktrace
});

export const sms2FAVerificationUnexpectedError = ({ cellphoneNumber, stacktrace }) => ({
  code: 'AUTHENTICATION_SMS_2FA_VERIFICATION_UNEXPECTED_ERROR',
  cellphoneNumber,
  stacktrace,
});

export const translatedError = (req, res, { err, statusCode = 401 }) =>
  res.status(statusCode).json(
    translate.error(err, req.locale, {})
  );
