import i18n from '@leonardosarmentocastro/i18n';
import __server__ from '@leonardosarmentocastro/server';
import theOwl from 'the-owl';

import modules from './modules/index.js';

const $middlewares = (app) => ({
  connect() {
    // Executes all functions except "connect".
    Object.keys(this)
      .filter(method => method !== 'connect')
      .forEach(method => this[method]());
  },
  i18n() {
    // NOTE: must come first to fill "req.locale" for all subsequent middlewares.
    i18n.connect(app);
  },
  generateApiDocs() {
    if (process.env.NODE_ENV === 'test') theOwl.connect(app);
  },
});

const $routes = (app) => ({
  connect() {
    // CONVENTION: Each module exports its "connect" function.
    Object.values(modules)
      .forEach(_module => _module.connect(app));
  },
});

export const server = {
  ...__server__,
  async start(port) {
    const api = await __server__.start(port, {
      middlewares: (app) => {
        $middlewares(app).connect();
      },
      routes: (app) => {
        $routes(app).connect();
      },
    });

    return api;
  },
};
