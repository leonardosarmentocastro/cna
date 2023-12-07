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
const { getModelPath } = require('./utils');

// TODO: como gerar documentação automática usando the-owl? vish, aí vai ser super sayadin
// Injeta o model num método que executa os tests e gera documentação. Uma engenharia reversa.
exports.crud = {
  connect(app, model = DEFAULTS.model, config = {
    middlewares: DEFAULTS.middlewares,
    options: DEFAULTS.options,
  }) {
    const basePath = getModelPath(model);
    console.log(`[ crud::info ] creating routes for "${basePath}"`);

    app.route(basePath)
      .get([
        ...config.middlewares,
        paginationMiddleware,
        readResolver(model, config.options),
      ])
      .post([
        ...config.middlewares,
        createResolver(model, config.options),
        serveCreatedDocResolver,
      ]);

    app.route(`${basePath}/:id`)
      .delete([
        ...config.middlewares,
        deleteResolver(model),
      ])
      .get([
        ...config.middlewares,
        readByIdResolver(model, config.options),
      ])
      .put([
        ...config.middlewares,
        updateResolver(model, config.options),
      ]);
  },
};
