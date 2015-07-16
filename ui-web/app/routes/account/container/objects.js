import Ember from 'ember';
import DS from 'ember-data';

var Promise = Ember.RSVP.Promise;

export default Ember.Route.extend({
  
  pathQuery: false,

  paramFor: function(param, name) {
    var route = this.container.lookup('route:' + name);
    return route && route.get(param);
  },

  model: function(params) {
    var account, container, query, contId;
    account = this.paramFor('account', 'account/container');
    query = {
      'container_id': account.get('id') + '/' + params.container_name,
      'path': params.path,
      'pathQuery': this.get('pathQuery')
    };
    contId = account.get('id') + "/" + params.container_name;
    this.set('cont', this.store.findById('container', contId));
    this.set('containerName', params.container_name);
    this.set('path', params.path);
    this.store.set('container_id', contId);
    return this.store.findQueryReloadable('object', query);
  },

  setupController: function(controller, model) {
    this._super(controller, model);
    controller.set('cont', this.get('cont'));
    controller.set('path', this.get('path'));
    controller.set('selectedItems', []);
  },

  renderTemplate: function(){
    this._super();
    this.render('bar/rt-objects', {
      into: 'application',
      outlet: 'bar-rt',
      controller: 'account/container/objects',
    });
  }

});
