const { signInResolver, signTokenResolver, signUpResolver } = require('./resolvers');

exports.connect = (app, model) => {
  app.post('/authentication/sign-in', [signInResolver(model), signTokenResolver]);
  app.post('/authentication/sign-up', signUpResolver(model));
};
