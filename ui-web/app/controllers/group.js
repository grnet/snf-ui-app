import Ember from 'ember';

export default Ember.ObjectController.extend({
  usersExtended: undefined,
  allUsersValid: false,
  cleanUserInput: true,

  init: function() {
    this.set('usersExtended', []);
    this._super();
  },

  areUsersValid: function() {
    var allUsersValid = this.get('usersExtended').every(function(user, index) {
      return user.get('status') === 'success';
    });
    if(this.get('usersExtended').get('length')) {
      this.set('allUsersValid', allUsersValid);
    }
    else {
      this.set('allUsersValid', false);
    }

  }.observes('usersExtended.@each', 'usersExtended.@each.status'),

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

    updateUser: function(email, data) {

      for(var prop in data) {
        this.get('usersExtended').findBy('email', email).set(prop, data[prop]);
      }

    },

    removeUser: function(email) {

      var user = this.get('usersExtended').findBy('email', email);

      this.get('usersExtended').removeObject(user);

    },

    findUser: function(email) {

      var self = this;
      var userEmail = 'email='+email;

      this.store.find('user', userEmail).then(function(user) {

        var userExtended = self.get('usersExtended').findBy('email', email);

          if(userExtended) {
            self.send('updateUser', email, {uuid: user.get('uuid'), status: 'success'});
          }
    },function(error) {

        var userExtended = self.get('usersExtended').findBy('email', email);

          if(userExtended) {
            self.send('updateUser', email, {uuid: undefined, status: 'error', 'errorMsg': 'Not found'});
          }
      });
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
                self.send('resetCreation');
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
