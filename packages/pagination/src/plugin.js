const DEFAULT = {
  options: {
    sensitive: true, // TODO: functional test with crud.readResolver
    toJson: true,
  },
};

const plugin = async function (pagination, options = DEFAULT.options) {
  const model = this; // function context reffers to mongoose model instance.
  const { conditions, limit, page, sort } = pagination;

  // computed values
  const totalCount = await model.find(conditions).countDocuments();
  const totalPages = Math.ceil(totalCount / limit);

  const hasNextPage = (page < totalPages);
  const hasPreviousPage = (page > 1);
  const nextPage = (hasNextPage ? page + 1 : null);
  const previousPage = (hasPreviousPage ? page - 1 : null);

  const skip = (page - 1) * limit;
  const query = model.find(conditions)
    .limit(limit)
    .skip(skip)
    .sort(sort);

  const docs = options.toJson ? (await query).map(doc => doc.toObject(options)) : await query;
  const results = {
    docs,
    hasNextPage,
    hasPreviousPage,
    nextPage,
    previousPage,
    totalCount,
    totalPages,
  };

  return results;
};

const paginationPlugin = (schema) => schema.statics.paginate = plugin;

module.exports = { plugin, paginationPlugin };
