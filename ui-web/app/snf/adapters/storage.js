import SnfRestAdapter from 'ui-web/snf/adapters/base';

/*
 * Synnefo storage API adapter.
 *
 * https://www.synnefo.org/docs/synnefo/latest/object-api-guide.html
 *
 */
export default SnfRestAdapter.extend({
  apiKey: 'storage',
  typePathMap: {
    'account': ''
  },

  typeHeadersMap: {
    'account': {
      'Accept': 'text/plain'
    }
  }
});
