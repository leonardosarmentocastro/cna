const dayjs = require('dayjs');

const inDays = (days) => new Date(dayjs().add(days, 'day').toISOString());

const PRODUCT1 = { createdAt: inDays(1), name: 'Beans', price: 1 };
const PRODUCT2 = { createdAt: inDays(2), name: 'Blueberry', price: 2 };
const PRODUCT3 = { createdAt: inDays(3), name: 'Bread', price: 3 };
const PRODUCT4 = { createdAt: inDays(4), name: 'Kiwi', price: 4 };
const PRODUCT5 = { createdAt: inDays(5), name: 'Orange', price: 5 };
const PRODUCT6 = { createdAt: inDays(6), name: 'Potato', price: 6 };
const PRODUCT7 = { createdAt: inDays(7), name: 'Rice', price: 7 };
const PRODUCT8 = { createdAt: inDays(8), name: 'Sausage', price: 8 };
const PRODUCT9 = { createdAt: inDays(9), name: 'Strawberry', price: 9 };
const PRODUCT10 = { createdAt: inDays(10), name: 'Tomato', price: 10 };

const PRODUCTS = [
  PRODUCT1,
  PRODUCT2,
  PRODUCT3,
  PRODUCT4,
  PRODUCT5,
  PRODUCT6,
  PRODUCT7,
  PRODUCT8,
  PRODUCT9,
  PRODUCT10,
];

module.exports = {
  PRODUCT1,
  PRODUCT2,
  PRODUCT3,
  PRODUCT4,
  PRODUCT5,
  PRODUCT6,
  PRODUCT7,
  PRODUCT8,
  PRODUCT9,
  PRODUCT10,
  PRODUCTS,
};
