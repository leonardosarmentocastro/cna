export const validUserFixture = {
  email: 'email@domain.com',
  username: 'username123',
  password: 'abc123def!@#' // score 3
};

// Prefix all valid user properties values, to conveniently create new users using the same fixture.
export const validPrefixedUserFixture = (prefix) => Object.entries(validUserFixture)
  .reduce((accumulator, [ key, value ]) => ({ ...accumulator, [key]: `${prefix}_${value}` }), {});
