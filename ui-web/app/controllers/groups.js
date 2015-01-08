import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'group',

  actions: {
    createGroup: function(){
      var self = this;
      var name = this.get('newName');
      var emails = this.get('newEmails').split(',');
      
      if (!name.trim()) { return; }
      if (emails.length <1 ) { return; }

      var onSuccess = function() {
        self.set('newName', undefined);
        self.set('newEmails', undefined);
      };
      
      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      var users = emails.map(function(email) {
        var userEmail = 'email='+email.trim();
        return self.store.find('user', userEmail);
      });

      return Ember.RSVP.all(users).then(function(res){
        var group = self.store.createRecord('group', {
          name: name,
          id: name,   
        });
        group.get('users').then(function(users){
          users.pushObjects(res);
          group.save().then(onSuccess, onFail);
        });
      });

    }
  }

});
