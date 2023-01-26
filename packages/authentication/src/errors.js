import { translate } from '@leonardosarmentocastro/i18n';

export const authenticationErrorCellphoneNotFound = (cellphone) => ({
  code: 'AUTHENTICATION_ERROR_CELLPHONE_NOT_FOUND',
  field: 'cellphone',
  value: cellphone,
});

export const authenticationErrorPasswordMismatch = (password) => ({
  code: 'AUTHENTICATION_ERROR_PASSWORD_MISMATCH',
  field: 'password',
  value: password,
});

export const translatedError = (req, res, { err, statusCode = 401 }) =>
  res.status(statusCode).json(
    translate.error(err, req.locale, {})
  );
