import ObjectController from 'ui-web/controllers/object';
import EmailsInputAuxMixin from 'ui-web/mixins/emails-input-aux';

export default ObjectController.extend(EmailsInputAuxMixin, {

  name: 'sharing',
  isPublic: false,

  setPublic: function(){
    var isPublic = this.get('model.public_link')? true: false;
    this.set('isPublic', isPublic);
  }.observes('model.public_link'),

  isShared: function(){
    return this.get('model').get('sharing')? true: false;
  }.property('model.sharing'),

  // returns True if the object is privately shared with everyone
  isSharedAll: function(){
    return this.get('isShared') && this.get('model.sharing').indexOf('*') > 0;
  }.property('model.sharing','isShared'),

  watchGroup: function(){
    var selectedGroup = this.get('selectedGroup');
    if (selectedGroup) {
      this.send('shareWithGroup', selectedGroup);
    }
  }.observes('selectedGroup'),


  // If the object is shared with individual users, it includes the user
  // to the shared_with list.
  // If the object is shared with group, it sets as display_name the group's 
  // name and if it is shared with all, it sets the display_name to a more 
  // verbose version of 'all' 
  shared_with_list: function(){
    var self = this;
    var shared_with_users = this.get('model.shared_users').filterBy('type', 'user');
    var shared_with_groups = this.get('model.shared_users').filterBy('type', 'group');
    var shared_with_everybody = this.get('model.shared_users').filterBy('type', 'all');

    _.each(shared_with_users, function(s){
        s.set('user', self.store.find('user', s.id));
    });

    _.each(shared_with_groups, function(s){
      s.set('display_name', s.id.split(':')[1]);
    });

    if(shared_with_everybody.length > 0) {
      shared_with_everybody[0].set('display_name', 'All Pithos users');
      
    }

    return shared_with_users.sortBy('user.email').concat(shared_with_groups.sortBy('display_name'), shared_with_everybody) ;
  }.property('model.shared_users.@each'),

  /**
   * Ugly function that converts model's  
   * `shared_users` list to a `sharing` string
   *
   * @method shared_users_to_sharing
   * @param shared_users {Array}
   * @return sharing {string} 
   */

  shared_users_to_sharing: function(shared_users){
    var read_users = _.filter(shared_users, function (el ) { return el.permission === 'read';}); 
    var write_users = _.filter(shared_users, function (el ) { return el.permission === 'write';}); 
    var read = null;
    var write = null;
    if (read_users.length >0 ) {
      var reads_arr = [];
      read_users.forEach(function(el){
        reads_arr.push(el.id);
      });
      read = 'read='+ reads_arr.join(',');
    }
    if (write_users.length >0 ) {
      var write_arr = [];
      write_users.forEach(function(el){
        write_arr.push(el.id);
      });
      write = 'write='+ write_arr.join(',');
    }
    var res = [];
    if (read) { res.push(read); }
    if (write) { res.push(write); }
    return res.join(';');
  },

  watchPublic: function(){
    this.send('togglePublic');
  }.observes('isPublic'),

  actions: {
    addUser: function(user) {
      var usersExtended = this.get('usersExtended');
      var notInserted = !usersExtended.findBy('email', user.email);
      var notShared = true;
      var self = this;

      var usersShared = this.get('shared_with_list').filterBy('type', 'user').map(function(item) {
        return item.user;
      });

      if(usersShared.get('length') !==0) {
        notShared = !usersShared.findBy('email', user.email);
      }

      if(notInserted && notShared) {
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

    togglePublic: function(){
      var object = this.get('model');
      this.store.setPublic(object, this.get('isPublic')).then(function(data){
        object.set('public_link', data);
      });
    },

    togglePermission: function(param){
      var object = this.get('model');
      var u_arr = object.get('shared_users');
      _.map(u_arr, function(el){
        if (el.id === param.name) {
          el.set('permission',param.value);
        }
      });
      var sharing = this.shared_users_to_sharing(u_arr);
      this.store.setSharing(object, sharing);
    },

    removeUserFromShare: function(id){
      var self = this;
      var object = this.get('model');
      var u_arr = object.get('shared_users');

      var u_arr_new = _.reject(u_arr, function(el) {
        return el.id === id;
      });

      var onSuccess = function() {
        object.set('sharing', sharing);
      };

      var onFail = function(reason){
        self.send('showErrorDialog', reason);
      };


      var sharing = this.shared_users_to_sharing(u_arr_new);
      this.store.setSharing(object, sharing).then(onSuccess, onFail);
    },

    removePrivateSharing: function(){
      var self = this;
      var object = this.get('model');

      var onSuccess = function() {
        object.set('sharing', sharing);
      };

      var onFail = function(reason){
        self.send('showErrorDialog', reason);
      };

      var sharing = this.shared_users_to_sharing([]);
      this.store.setSharing(object, sharing).then(onSuccess, onFail);
    },

    shareWithAll: function(){
      var self = this;
      var object = this.get('model');
        
      var shared_users = _.reject(object.get('shared_users'), function(el){
        return el.permission === 'read';
      });
      
      var shared = UiWeb.Shared.create({
          'permission': 'read',
          'id': '*', 
          'type': 'all',
      });

      shared_users.pushObject(shared);

      var onSuccess = function() {
        object.set('sharing', sharing);
      };

      var onFail = function(reason){
        self.send('showErrorDialog', reason);
      };

      var sharing = this.shared_users_to_sharing(shared_users);
      this.store.setSharing(object, sharing).then(onSuccess, onFail); 
    },

    shareWithUsers: function(){
      if(!this.get('freezeCreation')) {
        var self = this;
        var object = this.get('model');
        var uuids = this.get('usersExtended').mapBy('uuid');
        var u_arr = object.get('shared_users');
        var sharing;


        var onSuccess = function(res) {
          self.send('reset');
          object.set('sharing', sharing);
        };

        var onFail = function(reason){
          self.send('showErrorDialog', reason);
        };

        self.store.filter('user', function(user) {
          var id = user.get('id');
          if(uuids.indexOf(id) !== -1) {
            return user;
          }
        }).then(function(newUsers) {
          newUsers.forEach(function(user){

            var shared = UiWeb.Shared.create({
                'permission': 'read',
                'id': user.get('id'), 
                'type': 'user',
            });

            u_arr.pushObject(shared);
          });

          sharing = self.shared_users_to_sharing(u_arr);
          self.store.setSharing(object, sharing).then(onSuccess, onFail);
        });
      }
    },

    shareWithGroup: function(group){
      var self = this;
      var object = this.get('model');
      var u_arr = object.get('shared_users');
      var shared_with_list = this.get('shared_with_list');

      var onSuccess = function(res) {
        self.set('selectedGroup', null);
        object.set('sharing', sharing);
      };

      var onFail = function(reason){
        self.send('showErrorDialog', reason);
      };

      // if the object is already shared with this group return
      var group_arr = _.pluck(shared_with_list, 'display_name');
      if (_.contains(group_arr, group.get('name'))) {
        return;
      }

      var shared = UiWeb.Shared.create({
          'permission': 'read',
          'id': this.get('settings').get('uuid')+':'+group.get('id'), 
          'type': 'group',
      });
 
      u_arr.pushObject(shared);

      var sharing = this.shared_users_to_sharing(u_arr);
      this.store.setSharing(object, sharing).then(onSuccess, onFail); 
    }

  }
});
