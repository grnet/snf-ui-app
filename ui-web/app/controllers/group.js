import Ember from 'ember';

export default Ember.ObjectController.extend({
  _members: function(){
  
    var that = this;
    var emails = this.get('model').get('emails');
    var uuids = this.get('model').get('uuids');

    this.store.user_catalogs(uuids, emails).then(function(res){
      that.set('members', res);
    });
    return;
  }.property('model.uuids'),

  members: function(){
    this.get('_members');
    return []; 
  }.observes('_members').property(),

  actions: {

    deleteGroup: function(){
      var self = this;
      var group = this.get('model');

      var onSuccess = function(data) {
        data.deleteRecord();
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      group.set('uuids', '~');
      group.save().then(onSuccess, onFail);
      group.deleteRecord();

    },

    removeUserFromGroup: function(uuid){
      var self = this;
      var group = this.get('model');
      console.log('uuids BEFORE user removal:', group.get('uuids'));
 
      var onSuccess = function(data) {
        console.log('uuids AFTER user removal:', data.get('uuids'));
      };

      var onFail = function(reason){
        self.send('showActionFail', reason)
      };


      var uuids_arr = group.get('uuids').split(',');
      var index = uuids_arr.indexOf(uuid);
      if (index>-1) {
        uuids_arr.splice(index,1);
      }
      // If there are no users, delete the group
      if (uuids_arr.length === 0 ){
        this.send('deleteGroup');
        return;
      }

      var uuids = uuids_arr.join(',');
      group.set('uuids', uuids);
      group.save().then(onSuccess, onFail);

     
    }
  },
});
