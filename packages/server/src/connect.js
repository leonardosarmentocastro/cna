const express = require('express');
const cors = require('cors');

const DEFAULT = {
  middlewares: (app = express()) => ({
    connect() {
      // Executes all functions except "connect".
      Object.keys(this)
        .filter(method => method !== 'connect')
        .forEach(method => this[method]());
    },
    bodyParser() {
      app.use(express.json());
      app.use(express.urlencoded({
        extended: true
      }));
    },
    cors() {
      app.use(cors());
    },
    prettifyJsonOutput() {
      app.set('json spaces', 2);
    },
  }),

  routes: (app = express()) => ({
    connect: () => {
      const resolver = (request, response) => response.status(200).json({ application: 'up' });

      app.get('/', resolver);
      app.get('/health', resolver);
    },
  }),
};

exports.connect = (app = express()) => ({
  middlewares: DEFAULT.middlewares(app),
  routes: DEFAULT.routes(app),
});
