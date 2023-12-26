export const getAuthenticationToken = (req) => {
  const header = req.header('Authorization') || '';
  const [ type, authenticationToken = '' ] = header.trim().split(' ');

  return authenticationToken;
};
