const test = require('ava');

const { plugin, paginationPlugin } = require('../../plugin');

test('(paginationPlugin) must plug a static function named "paginate" on schema', t => {
  const schema = { statics: {} };
  paginationPlugin(schema);

  t.is(schema.statics.paginate, plugin);
});
