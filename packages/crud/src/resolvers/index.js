module.exports = {
  ...require('./create-resolver'),
  ...require('./read-resolver'),
  ...require('./read-by-id-resolver'),
  ...require('./update-resolver'),
  ...require('./delete-resolver'),
};
