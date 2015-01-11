import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'group',
  
  newNameToLower: function() {
    this.set('newName', this.get('newName').toLowerCase());
  }.observes('newName'),

  actions: {
    createGroup: function(){
      var self = this;
      var name = this.get('newName');
      var emails = this.get('newEmails');
      
      if (!name.trim()) { return; }
      if (!emails.trim()) { return; }

      emails = emails.split(',');
      if (emails.length <1 ) { return; }

      var onSuccess = function() {
        self.set('newName', '');
        self.set('newEmails', '');
      };
      
      var onFail = function(reason){
        console.log('reason:', reason);
        self.send('showActionFail', reason);
      };

      // get users by email
      var users = emails.map(function(email) {
        var userEmail = 'email='+email.trim();
        return self.store.find('user', userEmail);
      });

      // wait until all users are retrieved
      return Ember.RSVP.all(users).then(function(res){
        // create a group with no users
        var group = self.store.createRecord('group', {
          name: name,
          id: name,   
        });
        // add users to the newly created group
        group.get('users').then(function(users){
          users.pushObjects(res);
          group.save().then(onSuccess, onFail);
        });
      }, onFail);

    }
  }

});
