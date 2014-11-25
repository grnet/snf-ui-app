import Ember from 'ember';

export default Ember.ObjectController.extend({
  _members: function(){
    var uuids = this.get('model').get('uuids');
    var that = this;

    this.store.user_catalogs(uuids).then(function(res){
      that.set('members', res);
    });
    return;
  }.property('model'),

  members: function(){
    this.get('_members');
    return []; 
  }.observes('_members').property(),

  actions: {
    deleteGroup: function(){
	    var self = this;
      var group = this.get('model');
      var onSuccess = function(container) {
        console.log('delete group: onSuccess');
      };

      var onFail = function(reason){
        console.log('deleteGroup',reason);
        self.send('showActionFail', reason);
      };
      group.deleteRecord();
      group.save().then(onSuccess, onFail);
    },
  },
});
