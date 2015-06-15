import Ember from 'ember';
import EmailsInputAuxMixin from 'ui-web/mixins/emails-input-aux';

export default Ember.Controller.extend(EmailsInputAuxMixin, {
  itemType: 'group',

  freezeCreation: function() {

    var allUsersValid = this.get('allUsersValid');
    var cleanUserInput = this.get('cleanUserInput');

    return !(allUsersValid && cleanUserInput);
  }.property('allUsersValid', 'cleanUserInput'),

  verb_for_action: function(){
    var action = this.get('actionToPerform');
    var dict = {
      'deleteGroup': 'delete',
    };
    return 'delete';
    return dict[action];
  }.property('actionToPerform'),
  
  confirm_intro: function(){
    if (this.get('verb_for_action')) {
      var verb =  this.t('action_verb.'+this.get('verb_for_action'));
      var name = this.get('model.name');
      return this.t('overlay.confirm_simple.intro', 1,  verb , 'group', name);
    }
  }.property('verb_for_action', 'model.name'),

  confirm_button: function(){
    if (this.get('verb_for_action')) {
      return this.t('button.'+this.get('verb_for_action'));
    }
  }.property('verb_form_action'),

  sortedUsers: function() {
    var usersSorted = this.get('model').get('users').sortBy('email');
    return usersSorted;
  }.property('model.users.@each.email'),

  actions: {

    addUser: function(user) {
      var usersExtended = this.get('usersExtended');
      var notInserted = usersExtended.filterBy('email', user.email).get('length') === 0;
      var notMember = this.get('model').get('users').filterBy('email', user.email).get('length') === 0;

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

      group.get('users').then(function(users){
        users.removeObject(user);
        if (users.get('length') === 0) {
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
