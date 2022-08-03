const MessageFormat = require('messageformat');

const { $translations } = require('./translations');

class Translate {
  constructor() {
    const translations = $translations();

    const translationFiles = translations.load();
    const availableLanguages = translations.getAvailableLanguages();
    const mf = new MessageFormat(availableLanguages);

    this.translate = mf.compile(translationFiles);
  }

  error(err, locale, args) {
    const errorArgs = { ...err, ...args };
    const translation = this.get(err.code, locale, errorArgs);

    return {
      ...err,
      message: translation,
    };
  }

  get(key, locale, args) {
    const getTranslation = this.translate[locale][key];
    if (!getTranslation) throw new Error(`Translation not found for key: "${key}".`);

    const translation = getTranslation(args);
    return translation;
  };
}

// Exposes a singleton to avoid loading/compiling translation everytime they are required.
exports.translate = new Translate();
