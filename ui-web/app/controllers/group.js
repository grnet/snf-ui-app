import Ember from 'ember';

export default Ember.ObjectController.extend({
  _members: function(){
  
    var that = this;
    var emails = this.get('model').get('emails');
    var uuids = this.get('model').get('uuids');

    this.store.user_catalogs(uuids, emails).then(function(res){
      that.set('members', res.members);
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
 
      var onSuccess = function(data) {
        console.log(self.get('members'));
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
    },

    addUsers: function(){
      
      var self = this;
      var group = this.get('model');

      var newEmails = this.get('newEmails');
      
      if (!newEmails.trim()) { return; }

      var oldEmails = [];
      this.get('members').forEach(function(m){
            oldEmails.push(m.email);
      });

      var emails = oldEmails.join(',')+','+newEmails;

      var onSuccess = function(res) {
        console.log(self.get('members'));
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
