# pagination

mongoose pagination (mongoose plugin + express middleware)

## How it works?

Create a Mongoose model and plug in the pagination schema:

```js
const Mongoose = require('mongoose');
const { paginationPlugin } = require('@leonardosarmentocastro/pagination');

const schema = new Mongoose.Schema({ name: String, price: Number });
schema.plugin(paginationPlugin);
const model = Mongoose.model('Product', schema);
```

Perform queries sending relevant metadata, such as `conditions` (criterias), `limit`, `page` and `sorting`:

```js
const {
  PRODUCTS,
  PRODUCT1, PRODUCT2, PRODUCT3,
  PRODUCT4, PRODUCT5, PRODUCT6,
  PRODUCT7, PRODUCT8, PRODUCT9,
  PRODUCT10
} = require('../../__fixtures__');

(async () => {
  for (const product of PRODUCTS) {
    await model.create(product);
  }

  const pagination = { conditions: {},  limit: 5,  page: 2, sort: { price: 'desc' } };
  const results = await model.paginate(pagination);
  console.log(results);
  /** {
    docs: [ PRODUCT5, PRODUCT4, PRODUCT3, PRODUCT2, PRODUCT1 ],
    hasNextPage: false,
    hasPreviousPage: true,
    nextPage: null,
    previousPage: 1,
    totalCount: 10,
    totalPages: 2,
  } **/
})();
```
