const { createResolver } = require('@leonardosarmentocastro/crud');

const { DEFAULTS } = require('../defaults');
const { signTokenResolver } = require('./sign-token-resolver');

exports.signUpResolver = (model = DEFAULTS.model) => [ createResolver(model), signTokenResolver ];
