import upash from 'upash';
import pbkdf2 from '@phc/pbkdf2';
upash.install('pbkdf2', pbkdf2);

// Reference: https://github.com/simonepri/phc-pbkdf2
export const encrypter = ({
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
