export const getAuthenticationToken = (req) => {
  const [ type, authenticationToken = '' ] = req.header('Authorization').trim().split(' ');
  return authenticationToken;
};
