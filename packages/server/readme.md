# server - minimal production server

Create a production ready Express.js server with start/listen/close capabilities.

## How it works

The simplest way to get a server with health-check up and running would be:

```js
const server = require('@leonardosarmentocastro/server');

(async () => {
  const port = 8080;
  const api = await server.start(port);
  
  const body = await fetch(`http://127.0.0.1:${port}/`).json();
  console.log(body); // `{ application: 'up' }`
  
  await server.close(api);
})();
```

You can customize your own routes by:

```js
const port = 8080;
const api = await server.start(port, {
  routes: (app) => {
    app.get('/custom-route', (req, res) => res.json({ customizable: true }))
  },
});

const body = await fetch(`http://127.0.0.1:${port}/custom-route`).json();
console.log(body); `{ customizable: true }`
```

Or even attach application middlewares:

```js
const port = 8080;
const api = await server.start(port, {
  middlewares: (app) => {
    app.use((req, res, next) => {
      res.set('customizable', true);
      next();
    });
  },
});

const response = await fetch(`http://127.0.0.1:${port}`);
console.log(response.headers.customizable); // `"true"`
```
