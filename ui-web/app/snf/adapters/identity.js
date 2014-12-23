import SnfRestAdapter from 'ui-web/snf/adapters/base';

/*
 * Synnefo Identity adapter.
 * 
 * https://www.synnefo.org/docs/synnefo/latest/identity-api-guide.html
 *
 */
export default SnfRestAdapter.extend({
  apiKey: 'account',
  typePathMap: {
    'user': 'user_catalogs'
  },
  
  optionsForType: function(type, options) {
    if (type == 'user') {
      // at the moment we allow only single user id resolving
      var urlParts = options.url.split("/");
      var userId = urlParts[urlParts.length - 1];
      return {
        'url': options.url.replace(userId, ''),
        'type': 'POST',
        'data': JSON.stringify({
          'uuids': [userId]
        })
      }
    }
  }
});

