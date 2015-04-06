import Ember from 'ember';
import EmailsInputAuxMixin from '../mixins/emails-input-aux';

export default Ember.ObjectController.extend(EmailsInputAuxMixin, {

  freezeCreation: function() {

    var allUsersValid = this.get('allUsersValid');
    var cleanUserInput = this.get('cleanUserInput');

    return !(allUsersValid && cleanUserInput);
  }.property('allUsersValid', 'cleanUserInput'),

  actions: {

    addUser: function(user) {
      var usersExtended = this.get('usersExtended');
      var notInserted = usersExtended.filterBy('email', user.email).get('length') === 0;
      var notMember = this.get('users').filterBy('email', user.email).get('length') === 0;

      if(notInserted && notMember) {

        var userExtended = Ember.Object.create({
          email: user.email,
          status: user.status,
          errorMsg: user.errorMsg,
        });
        this.get('usersExtended').pushObject(userExtended)

        if(user.status !== 'error') {
          this.send('findUser', user.email);
        }
      }
    },

    deleteGroup: function(){
      var group = this.get('model');
      var self = this;

      var onSuccess = function(data) {
        console.log('success');
      };

      var onFail = function(reason){
        console.log('reason:', reason);
        self.send('showActionFail', reason);
      };

      group.destroyRecord().then(onSuccess, onFail);
    },

    removeUserFromGroup: function(user){
      var self = this;
      var group = this.get('model');

      var onSuccess = function(data) {
        console.log('success');
      };

      var onFail = function(reason){
        console.log('reason:', reason);
        self.send('showActionFail', reason);
      };

      group.get("users").then(function(users){
        users.removeObject(user);
        if (users.content.length === 0) {
          self.send('deleteGroup');
        } else {
          group.save().then(onSuccess, onFail);
        }
      }, onFail);
   },

    addUsersToGroup: function(){
      if(!this.get('freezeCreation')) {
        var self = this;
        var group = this.get('model');
        var uuids = this.get('usersExtended').mapBy('uuid');

        self.store.filter('user', function(user) {
          var id = user.get('id');
          if(uuids.indexOf(id) !== -1) {
            return user;
          }
        }).then(function(newMembers) {

            group.get('users').then(function(users){
              newMembers.forEach(function(user) {
                users.pushObject(user)
              });

              group.save().then(function(){
                self.send('reset');
              }, function(error) {
                self.send('showActionFail', error)
                console.log('ERROR!')
              });
            });
        });
      }
    }
  },
});
