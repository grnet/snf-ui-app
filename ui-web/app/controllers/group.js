import Ember from 'ember';

export default Ember.ObjectController.extend({
  members: undefined,
  _members: function(){
    var self = this;
    var uuids = this.get('model').get('uuids');

    this.store.user_catalogs(uuids).then(function(res){
      self.set('members', res.members);
    });
    return;
  }.observes('model.uuids').on('init'),

  actions: {
    deleteGroup: function(){
      var self = this;
      var group = this.get('model');

      var onSuccess = function(data) {
        group.deleteRecord();
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      group.set('uuids', '~');
      group.save().then(onSuccess, onFail);
    },

    removeUserFromGroup: function(uuid){
      var self = this;
      var group = this.get('model');
      var uuids_arr = group.get('uuids').split(',');
      var index = uuids_arr.indexOf(uuid);

      var onSuccess = function(data) {
        console.log('success');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason)
      };


      // Remove the user for the uuids list
      if (index>-1) {
        uuids_arr.splice(index,1);
      }
      // If there are no users, delete the group
      if (uuids_arr.length === 0 ){
        this.send('deleteGroup');
        return;
      }

      group.set('uuids', uuids_arr.join(','));
      group.save().then(onSuccess, onFail);
    },

    addUsers: function(){
      
      var self = this;
      var group = this.get('model');
      var newEmails = this.get('newEmails');
      var oldEmails = [];

      if (!newEmails.trim()) { return; }

      this.get('members').forEach(function(m){
            oldEmails.push(m.email);
      });

      var emails = oldEmails.join(',')+','+newEmails;

      var onSuccess = function(res) {
        console.log('success');
      };
      
      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      this.set('newEmails', '');

      this.store.user_catalogs(null, emails).then(function(res){
        if (!res.uuids) { return };
        group.set('uuids', res.uuids);
        group.save().then(onSuccess, onFail);
      });

    }

  },
});
