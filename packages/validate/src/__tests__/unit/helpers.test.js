const test = require('ava');

const { indexArrayAttributes } = require('../../helpers');

test('(indexArrayAttributes) must create a list with object paths for all entries in array', t => {
  const obj1 = { id: 1, foo: 'a', bar: 'b' };
  const obj2 = { id: 2, foo: 'c', bar: 'd' };
  const obj3 = { id: 3, foo: 'e', bar: 'f' };

  const doc1 = { list: [ obj1, obj2, obj3 ], notList: '' };
  const property1 = 'list';
  const attributes1 = [ 'id', 'foo', 'bar' ];
  const indexes1 = indexArrayAttributes(doc1, property1, attributes1);
  t.deepEqual(indexes1, [
    'list[0].id',
    'list[0].foo',
    'list[0].bar',
    'list[1].id',
    'list[1].foo',
    'list[1].bar',
    'list[2].id',
    'list[2].foo',
    'list[2].bar',
  ]);

  const doc2 = { array: [ obj1, obj2, obj3 ], notArray: '' };
  const property2 = 'array';
  const attributes2 = [ 'id' ];
  const indexes2 = indexArrayAttributes(doc2, property2, attributes2);
  t.deepEqual(indexes2, [ 'array[0].id', 'array[1].id', 'array[2].id' ]);
});
