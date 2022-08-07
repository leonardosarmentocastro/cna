import theOwl from 'the-owl';

import { LOCALE, TIMEOUT } from './constants.js';

// TODO: Doesn't include "Authorization" header if not necessary.
export const getRequestOptions = (t) => ({
  headers: {
    'accept-language': LOCALE, // Language which the application will serve content.
    // 'Authorization': process.env.AUTHORIZATION_TOKEN, // Authorize requests to private routes.
    ...theOwl.buildHeaders(t.title, t.context.endpointOriginalPath) // Generate API docs based on functional test results.
  },
  // json: true, // Automatically parses "response.body": https://github.com/sindresorhus/got/issues/174#issuecomment-298292987
  method: t.context.endpointMethod || 'get',
  timeout: {
    request: TIMEOUT,
  },
});
