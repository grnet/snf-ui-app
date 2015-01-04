import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'group',

  actions: {
    createGroup: function(){

      var name = this.get('newName');
      var emails = this.get('newEmails').split(',');

      var self = this;
      
      if (!name.trim()) { return; }
      if (emails.length <1 ) { return; }

      var onSuccess = function(group) {
          console.log('create group onSuccess');
        };
      
      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      this.set('newName', '');
      this.set('newEmails', '');
      
      var users = [];

      var findUsers = function(i) {
        var userEmail = 'email='+emails[i].trim();
        self.store.find('user', userEmail).then(function(user){
          users.push(user.get('uuid'));
          if (i=== emails.length-1) {
            makeGroup(users);
          } else {
            findUsers(i+1);
          }
        });
      }
      findUsers(0);
      
      var makeGroup = function(u){

        var group = self.store.createRecord('group', {
          name: name,
          id: name,   
          uuids: u.join(',')
        });
        group.save();
      }
     

    }
  }

});
