import { translate } from '@leonardosarmentocastro/i18n';

export const authenticationErrorCellphoneNumberNotFound = (cellphoneNumber) => ({
  code: 'AUTHENTICATION_ERROR_CELLPHONE_NUMBER_NOT_FOUND',
  field: 'cellphoneNumber',
  value: cellphoneNumber,
});

export const authenticationErrorPasswordMismatch = (password) => ({
  code: 'AUTHENTICATION_ERROR_PASSWORD_MISMATCH',
  field: 'password',
  value: password,
});

export const authenticationErrorRegistryForTokenNotFound = (authenticationToken) => ({
  code: 'AUTHENTICATION_ERROR_REGISTRY_FOR_TOKEN_NOT_FOUND',
  authenticationToken
});

export const translatedError = (req, res, { err, statusCode = 401 }) =>
  res.status(statusCode).json(
    translate.error(err, req.locale, {})
  );
