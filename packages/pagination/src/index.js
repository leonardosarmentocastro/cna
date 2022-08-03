// TODO: maybe create a small configurable package from this module?
// where you can set your own default and field validation functions,
// but the exposed interface through request and the static method
// is defined by us.
module.exports = {
  ...require('./middleware'),
  ...require('./plugin'),
};
