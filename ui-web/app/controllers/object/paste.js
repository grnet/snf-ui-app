import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['objects'],
  objectController: Ember.computed.alias('controllers.objects'),

  actions: {
    version: function(object) {
      this.get('objectController').send('pasteVersion', object); 
    },
    copy: function(object) {
      this.get('objectController').send('pasteCopy', object);
    }
  }
});
