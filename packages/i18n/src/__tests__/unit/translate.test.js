const test = require('ava');

const { translate } = require('../../translate');

const LOCALE_PRIMARY = 'en-us';
const LOCALE_SECONDARY = 'pt-br';
const LOCALES = [ LOCALE_PRIMARY, LOCALE_SECONDARY ];
const TRANSLATION_KEYS = [ 'TRANSLATED_HELLO' ];

TRANSLATION_KEYS.forEach(translationKey => {
  LOCALES.reduce((prevTranslation, locale) => {
    const args = {};
    const translation = translate.get(translationKey, locale, args);
    if (!prevTranslation) return translation;

    test(`must return translated content in "${LOCALES.toString()}" for translation key: "${translationKey}"`, t => {
      t.truthy(translation);
      t.truthy(prevTranslation);
      t.not(prevTranslation, translation);

      return translation;
    });
  }, '');
});

test('must return a validator error containing an translated message', t => {
  const error = { code: 'TRANSLATED_ERROR' };
  const args = { name: 'Leonardo' };
  const translation1 = translate.error(error, LOCALE_PRIMARY, args);
  const translation2 = translate.error(error, LOCALE_SECONDARY, args);

  t.truthy(translation1.message);
  t.truthy(translation2.message);
  t.not(translation1.message, translation2.message);
  t.notDeepEqual(translation1, translation2);
});
