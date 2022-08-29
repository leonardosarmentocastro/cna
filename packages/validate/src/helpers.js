// Creates a list of object paths for each attribute inside an array at the given MongoDB document.
exports.indexArrayAttributes = (
  doc = { list: [] },
  property = 'list',
  attributes = ['id', 'name'],
) => {
  const indexes = [...Array(doc[property].length).keys()]; // [ 0, 1, 2... ]
  return indexes.map(i =>
    attributes.map(attribute => (`${property}[${i}].${attribute}`)) // 'list[0].id'
  ).flat(); // [ 'list[0].id', list[0].category.id, ... ,'list[1].id', 'list[1].category.id']
};
