import { str, envsafe, url } from 'envsafe';

export const env = envsafe({
  STRAPI_BASE_API_URL: url({
    devDefault: 'http://127.0.01:1337/api/',
  }),
  STRAPI_API_TOKEN: str(),
});
