import Ember from 'ember';

export default Ember.Controller.extend({
  'title': function(){
      return this.get('settings').get('service_name');
  }.property(),
  'currentUser': function(){
    var uuid = this.get('settings').get('uuid');
    return this.store.find('user', uuid);
  }.property()

});
