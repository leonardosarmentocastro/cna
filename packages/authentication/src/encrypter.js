const upash = require('upash');
upash.install('pbkdf2', require('@phc/pbkdf2'));

// Reference: https://github.com/simonepri/phc-pbkdf2
exports.encrypter = ({
  hash: async (password) => {
    const hashedPassword = await upash.hash(password);
    return hashedPassword;
  },
  isHashed: (hashedPassword) => {
    try {
      const hashAlgorithm = upash.which(hashedPassword);
      return !!hashAlgorithm;
    } catch(err) {
      return false;
    }
  },
  verify: async (hashedPassword, password) => {
    const hasMatched = await upash.verify(hashedPassword, password);
    return hasMatched;
  },
});
