import dotenv from 'dotenv';
dotenv.config();

import { database } from '@leonardosarmentocastro/database';
import { server } from './src/server.js';

(async () => {
  try {
    await database.connect();
    await server.start();
  } catch(err) {
    console.error(err);
  }
})();
