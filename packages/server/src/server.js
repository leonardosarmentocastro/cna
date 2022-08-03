const express = require('express');
const { connect } = require('./connect');

const DEFAULT = {
  // connecting "middlewares" and "routes" are essentially the same.
  // the reason for dividing it in 2 methods is: middlewares must be set *first*.
  connect: {
    middlewares: (app = express()) => {},
    routes: (app = express()) => {},
  },
};

const server = {
  close(api) {
    return new Promise((resolve) => {
      if (!api.listening) return resolve();

      api.close(() => {
        const successMessage = '[ server::CLOSED ] Server closed successfully!';
        console.info(successMessage);

        resolve();
      });
    });
  },

  listen(app, port) {
    const environment = process.env.NODE_ENV;
    const options = { environment, port };

    return new Promise((resolve, reject) => {
      app.listen(options, function() {
        const successMessage = `[ server::STARTED ] Server listening on port ${port} in ${environment} mode.`;
        console.info(successMessage);

        const api = this; // The context of the anonymous callback function is the node server instance.
        return resolve(api);
      }).on('error', (err) => {
        const errorMessage = [
          `[ server::ERROR ] Failed to start server on port ${port} in ${environment} mode.`,
          `[ server::STACKTRACE ] ${err}`
        ].join('\r\n');

        return reject(new Error(errorMessage));
      });
    });
  },

  async start(port = process.env.PORT, __connect__ = DEFAULT.connect) {
    const app = express();
    const { middlewares, routes } = connect(app);

    if (__connect__.middlewares) __connect__.middlewares(app); // first custom middlewares
    middlewares.connect(); // then default middlewares

    if (__connect__.routes) __connect__.routes(app); // first custom routes
    routes.connect(); // then default routes

    const api = await this.listen(app, port);
    return api;
  },
};

module.exports = server;
