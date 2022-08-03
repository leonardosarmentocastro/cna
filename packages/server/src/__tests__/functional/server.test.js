const test = require('ava');
const got = require('got');

const server = require('../../server');

test('server can start/close and is reachable', async t => {
  const port = 8080;
  const api = await server.start(port);

  const body = await got(`http://127.0.0.1:${port}/`).json();
  t.deepEqual(body, { application: 'up' });

  await server.close(api);
});

test('server is customizable (routes can be added)', async t => {
  const port = 8080;
  const api = await server.start(port, {
    routes: (app) => {
      app.get('/custom-route', (req, res) => res.json({ customizable: true }))
    },
  });

  const body = await got(`http://127.0.0.1:${port}/custom-route`).json();
  t.deepEqual(body, { customizable: true });

  await server.close(api);
});

test('server is customizable (middlewares can be added)', async t => {
  const port = 8080;
  const api = await server.start(port, {
    middlewares: (app) => {
      app.use((req, res, next) => {
        res.set('customizable', true);
        next();
      });
    },
  });

  const response = await got(`http://127.0.0.1:${port}`);
  t.is(response.headers.customizable, 'true');

  await server.close(api);
});

test('(server.start) param "port" must use "process.env.PORT" as default value', async t => {
  process.env.PORT = 9999;
  const api = await server.start();

  const response = await got(`http://127.0.0.1:${process.env.PORT}`);
  t.is(response.statusCode, 200);

  await server.close(api);
});


test('(error) can not start two servers using the same port', async t => {
  const port = 8080;
  const api = await server.start(port);

  await t.throwsAsync(async () => {
    await server.start(port);
  });

  await api.close();
});

test('by default, the server parses json bodies from requests', async t => {
  const port = 8080;
  const payload = { example: true };
  const api = await server.start(port, {
    routes: (app) => {
      app.post('/json', (req, res) => {
        t.deepEqual(req.body, payload, 'tip: if json parsing is disable, "req.body" would be "undefined"');
        return res.status(200).json(req.body);
      });
    },
  });

  const body = await got.post(`http://127.0.0.1:${port}/json`, { json: payload }).json();
  t.deepEqual(body, payload); // just... double checking. :)

  await api.close();
});
