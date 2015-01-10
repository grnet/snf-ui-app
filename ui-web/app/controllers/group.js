import Ember from 'ember';

export default Ember.ObjectController.extend({

  onFail: function(reason){
    this.sendAction('showActionFail', reason);
  }, 

  actions: {
    deleteGroup: function(){
      var group = this.get('model');
      var onSuccess = function(data) {
        console.log('success');
      };

      group.deleteRecord();
      group.save().then(onSuccess, this.onFail);
    },

    removeUserFromGroup: function(user){
      var self = this;
      var group = this.get('model');

      var onSuccess = function(data) {
        console.log('success');
      };

      group.get("users").then(function(users){
        users.removeObject(user);
        if (users.content.length === 0) {
          self.send('deleteGroup');
        } else {
          group.save().then(onSuccess, self.onFail);
        }
      });
   },

    addUsers: function(){
      var self = this;
      var group = this.get('model');
      var newEmails = this.get('newEmails') || '';
      if (!newEmails.trim()) { return; }

      newEmails = newEmails.split(',');
      if (newEmails.length <1 ) { return; }

      var oldEmails = [];

      var onSuccess = function(data) {
        self.set('newEmails', undefined);
      };
 
      var newUsers = newEmails.map(function(email) {
        var userEmail = 'email='+email.trim();
        return self.store.find('user', userEmail);
      });

      return Ember.RSVP.all(newUsers).then(function(res){ 
        group.get('users').pushObjects(res).then(function() {
          group.save().then(onSuccess, self.onFail);
        });;
      });

    }

  },
});
