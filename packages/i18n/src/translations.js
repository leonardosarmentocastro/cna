const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const DEFAULT = {
  __readdirSync: fs.readdirSync,
  __readFileSync: fs.readFileSync
};
const TRANSLATIONS_FILE_EXTENSION = '.yml';
const TRANSLATIONS_PATH = `${process.cwd()}/translations`;
const options = { encoding: 'utf8' };

const $translations = ({
  __readdirSync,
  __readFileSync,
} = DEFAULT) => ({
  getAvailableLanguages() {
    return this.getTranslationFileNames()
      .filter(translationFileName => {
        const fileExtension = path.extname(translationFileName).toLowerCase();
        return (fileExtension === TRANSLATIONS_FILE_EXTENSION);
      })
      .reduce((availableLanguages, translationFileName) => {
        const [ language ] = translationFileName.split(TRANSLATIONS_FILE_EXTENSION);
        return availableLanguages.concat(language);
      }, []);
  },

  getTranslationFileNames() {
    return __readdirSync(TRANSLATIONS_PATH, options);
  },

  load() {
    return this.getAvailableLanguages()
      .reduce((translationFiles, language) => {
        const translationFilePath = `${TRANSLATIONS_PATH}/${language}${TRANSLATIONS_FILE_EXTENSION}`;
        const textContent = __readFileSync(translationFilePath, options);

        return {
          ...translationFiles,
          [language]: yaml.load(textContent),
        };
      }, {})
  },
});

module.exports = { $translations, TRANSLATIONS_FILE_EXTENSION };
