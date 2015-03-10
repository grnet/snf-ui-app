import SnfRestAdapter from 'ui-web/snf/adapters/base';

/*
 * Synnefo storage API adapter.
 *
 * https://www.synnefo.org/docs/synnefo/latest/object-api-guide.html
 *
 */
export default SnfRestAdapter.extend({
  account: Ember.computed.alias('settings.uuid'),

  apiKey: 'storage',
  typePathMap: function() {
    return {
      'account': '',
      'container': null,
      'object': null,
      'group': this.get('settings.uuid'),
      'version': this.get('settings.uuid')
    }
  }.property('settings.uuid'),

  typeHeadersMap: {
    'account': {
      'Accept': 'text/plain'
    },
  }
});
