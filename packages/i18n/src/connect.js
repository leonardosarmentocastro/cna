const locale = require("locale")

const { $translations } = require('./translations');
const DEFAULT_LANGUAGE = process.env.LANGUAGE || 'en-us';

// Exposes "req.locale" which is the best match for user's "accept-language" header.
exports.connect = (app) => {
  const availableLanguages = $translations().getAvailableLanguages();

  app.use(
    locale(availableLanguages, DEFAULT_LANGUAGE)
  );
};
