exports.validate = (constraints = [], doc = {}) =>
  constraints
    .reduce(async (err, constraint) => {
      if (!!(await err)) return err;

      const { validator, ...error } = constraint(doc);
      const isValid = await validator();
      return isValid ? null : error;
    }, null);
