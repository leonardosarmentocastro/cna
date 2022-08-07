import { server } from '../server.js';

export const closeApiOpenedOnRandomPort = (t) => server.close(t.context.api);
