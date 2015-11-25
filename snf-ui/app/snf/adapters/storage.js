import SnfRestAdapter from 'snf-ui/snf/adapters/base';

/*
 * Synnefo storage API adapter.
 *
 * https://www.synnefo.org/docs/synnefo/latest/object-api-guide.html
 *
 */
export default SnfRestAdapter.extend({
  account: Ember.computed.alias('settings.uuid'),
  
  buildURL: function(type, id, snapshot) {
    var url = [];
    var host = Ember.get(this, 'host');
    var prefix = this.urlPrefix();

    if (type) { url.push(this.pathForType(type)); }

    //We might get passed in an array of ids from findMany
    //in which case we don't want to modify the url, as the
    //ids will be passed in through a query param
    if (id && !Ember.isArray(id)) { 
      url.push(encodeURIComponent(id).replace(/%2f/gi, "/")); 
    }

    if (prefix) { url.unshift(prefix); }

    url = url.join('/');
    if (!host && url) { url = '/' + url; }

    return url;
  },

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
