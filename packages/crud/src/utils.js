const pluralize = require('pluralize');

const { DEFAULTS } = require('./defaults');

const kebabCase = (str) => str
  .replace(/([A-Z])([A-Z])/g, '$1-$2')
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/[\s_]+/g, '-')
  .toLowerCase();

const getModelPath = (model = DEFAULTS.model) => {
  const { modelName } = model.collection; // "DiscountCondition"
  const pluralizedModelName = pluralize(modelName); // "DiscountConditions"
  const basePath = `/${kebabCase(pluralizedModelName)}`; // "/discount-conditions"

  return basePath;
};

module.exports = { getModelPath, kebabCase };
