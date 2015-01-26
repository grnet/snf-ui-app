import ObjectController from '../object';

export default ObjectController.extend({

  isPublic: false,

  setPublic: function(){
    var isPublic = this.get('model').get('public_link')? true: false;
    this.set('isPublic', isPublic);
  }.observes('public_link'),

  isShared: function(){
    return this.get('model').get('sharing')? true: false;
  }.property('model.sharing'),

  // returns True if the object is privately shared with everyone
  isSharedAll: function(){
    return this.get('isShared') && this.get('model').get('sharing').indexOf('*') > 0;
  }.property('model.sharing'),

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
    var shared_with = this.get('model').get('shared_users');
    _.each(shared_with, function(s){
      if (s.type === 'user') {
        s.user = self.store.find('user', s.id);
      } else if (s.type === 'all'){
        s.display_name = 'All Pithos users';
      } else if (s.type === 'group') {
        s.display_name = s.id.split(':')[1];
      }
    });
      
    return shared_with;
  }.property('shared_users.@each'),

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
          el.permission = param.value;
        }
      });
      var sharing = this.shared_users_to_sharing(u_arr);
      this.store.setSharing(object, sharing);
    },

    removeUser: function(id){
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
        self.send('showActionFail', reason);
      };


      var sharing = this.shared_users_to_sharing(u_arr_new);
      this.store.setSharing(object, sharing).then(onSuccess, onFail);
    },

    removePrivateSharing: function(){
      var self = this;
      var object = this.get('model');
      var onSuccess = function() {
        object.set('shared_users', []);
        object.set('sharing', null);
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };
      this.store.setSharing(object, '').then(onSuccess, onFail);
    },

    shareWithAll: function(){
      var self = this;
      var object = this.get('model');
        
      var shared_users = _.reject(object.get('shared_users'), function(el){
        return el.permission === 'read';
      });
      shared_users.push({
        'id': '*',
        'type': 'all',
        'permission': 'read'
      });

      var onSuccess = function() {
        object.set('sharing', sharing);
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      var sharing = this.shared_users_to_sharing(shared_users);
      this.store.setSharing(object, sharing).then(onSuccess, onFail); 
    },

    shareWithUsers: function(){
      var self = this;
      var object = this.get('model');
      var emails = this.get('emails') || '';
      var u_arr = object.get('shared_users');
      var shared_with_list = this.get('shared_with_list');
      var sharing;

      if (!emails.trim()) { return; }

      emails = emails.split(',');
      if (emails.length <1 ) { return; }

      var onSuccess = function(res) {
        self.set('emails', '');
        object.set('sharing', sharing);
      };
      
      var onFail = function(reason){
        self.send('showActionFail', reason);
      };


      var newUsers = emails.map(function(email) {
        var userEmail = 'email='+email.trim();
        return self.store.find('user', userEmail);
      });

      var ids_arr = _.pluck(shared_with_list, 'id');
      return Ember.RSVP.all(newUsers).then(function(res){ 
        res.forEach(function(user){
          if (_.contains(ids_arr, user.get('id'))) {
            return; 
          }
          u_arr.pushObject ({
            'id': user.get('id'), 
            'permission': 'read',
            'type': 'user'
          });
        });

        sharing = self.shared_users_to_sharing(u_arr);
        self.store.setSharing(object, sharing).then(onSuccess, onFail); 

      }, onFail);
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
        self.send('showActionFail', reason);
      };
    
      // if the object is already shared with this group return
      var group_arr = _.pluck(shared_with_list, 'display_name');
      if (_.contains(group_arr, group.get('name'))) {
        return;
      }

      u_arr.pushObject ({
        'id': this.get('settings').get('uuid')+':'+group.get('id'), 
        'permission': 'read',
        'type': 'group'
      });

      var sharing = this.shared_users_to_sharing(u_arr);
      this.store.setSharing(object, sharing).then(onSuccess, onFail); 
    }

  }
});
