const { paginationMiddleware } = require('@leonardosarmentocastro/pagination');

const { DEFAULTS } = require('./defaults');
const {
  createResolver,
  deleteResolver,
  readResolver,
  readByIdResolver,
  serveCreatedDocResolver,
  updateResolver,
} = require('./resolvers');
const { kebabCase } = require('./utils');

// TODO: como gerar documentação automática usando the-owl? vish, aí vai ser super sayadin
// Injeta o model num método que executa os tests e gera documentação. Uma engenharia reversa.
exports.crud = {
  connect(app, model = DEFAULTS.model) {
    const { modelName } = model.collection; // "MaterialsCollection"
    const basePath = `/${kebabCase(modelName)}`; // "/materials-collection"
    console.log(`[ crud::info ] creating routes for "${basePath}"`);

    app.route(basePath)
      .get(paginationMiddleware, readResolver(model))
      .post(createResolver(model), serveCreatedDocResolver);

    app.route(`${basePath}/:id`)
      .delete(deleteResolver(model))
      .get(readByIdResolver(model))
      .put(updateResolver(model));
  },
};
