import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'group',

  /*
  * Pithos API allows the name of groups to have at most 256 chars
  * When a new group is created the length of the name is checked
  */
  nameMaxLength: 256,

  newName: undefined,
  isUnique: undefined,

  isNameValid: function() {
    /*
    * name is valid if it is unique because all other checks
    * have been executedfrom the input view, before the checkUnique function
    */
    return this.get('isUnique');
  }.property('isUnique'),

  allUsersValid: false,
  users: [],
  userData: undefined,

  freezeCreation: function() {
    var isNameValid = this.get('isNameValid')
    var allUsersValid = this.get('allUsersValid')
    return !(isNameValid && allUsersValid);
  }.property('isNameValid', 'allUsersValid'),


  checkUnique: function() {
    if(this.get('newName')) {

      var temp = [];
      var name = this.get('newName')

      /*
      * hasRecordForId: Returns true if a record for a given type and ID
      * is already loaded.
      * In our case the id of a container it's its name.
      */
      var isUnique = !this.get('store').hasRecordForId('group', name);
      this.set('isUnique', isUnique);
    }
  }.observes('newName'),

  actions: {
    findUser: function(email) {
      var self = this;
      var userEmail = 'email='+email;
      var users = [];
        self.store.find('user', userEmail).then(function(user) {
          var userExtendedData = Ember.Object.create({
            uuid: user.id,
            email: email,
            status: 'success'
          });
          self.get('users').pushObject(user);
          self.set('userData', userExtendedData);
        }, function(error) {
          var userExtendedData = Ember.Object.create({
            uuid: undefined,
            email: email,
            status: 'error',
            errorMsg: error.message
          });
          self.set('userData', userExtendedData);
        });
    },
    createGroup: function(){
      if(!this.get('freezeCreation')) {
        var self = this;
        var users = this.get('users');
        var name = this.get('newName');
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
          group.save()//.then(onSuccess, onFail);
        });
      } /*onFail*/);

      }
      // var self = this;
      // var name = this.get('newName');
      // var emails = this.get('newEmails');
      
      // if (!name.trim()) { return; }
      // if (!emails.trim()) { return; }

      // emails = emails.split(',');
      // if (emails.length <1 ) { return; }

      // var onSuccess = function() {
      //   self.set('newName', '');
      //   self.set('newEmails', '');
      // };
      
      // var onFail = function(reason){
      //   console.log('reason:', reason);
      //   self.send('showActionFail', reason);
      // };

      // // get users by email
      // var users = emails.map(function(email) {
      //   var userEmail = 'email='+email.trim();
      //   return self.store.find('user', userEmail);
      // });

      // // wait until all users are retrieved
      // return Ember.RSVP.all(users).then(function(res){
      //   // create a group with no users
      //   var group = self.store.createRecord('group', {
      //     name: name,
      //     id: name,   
      //   });
      //   // add users to the newly created group
      //   group.get('users').then(function(users){
      //     users.pushObjects(res);
      //     group.save().then(onSuccess, onFail);
      //   });
      // }, onFail);

    }
  }

});
