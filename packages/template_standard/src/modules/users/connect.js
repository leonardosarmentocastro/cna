import { crud } from '@leonardosarmentocastro/crud';
import { UsersModel } from './model.js';

export const connect = (app) => {
  crud.connect(app, UsersModel);
};
