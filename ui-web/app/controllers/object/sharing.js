import Ember from 'ember';

import ObjectController from '../object';

export default ObjectController.extend({
  isPublic: function(){
    return this.get('model').get('public_link')? true : false;
  }.property('model.public_link'),

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
      this.send('shareGroup', selectedGroup);
    }
    
  }.observes('selectedGroup'),

  /**
   * Ugly function that converts a 
   * `shared_users` list to a `sharing` string
   *
   * @method shared_users_to_sharing
   * @param u_arr {Array}
   * @return sharing {string} 
   */

  shared_users_to_sharing: function(u_arr){
    var read_users = _.filter(u_arr, function (el ) { return el.type === 'read'}); 
    var write_users = _.filter(u_arr, function (el ) { return el.type === 'write'}); 
    if (read_users.length >0 ) {
      var reads_arr = [];
      read_users.forEach(function(el){
        reads_arr.push(el.id);
      });
      var read = 'read='+ reads_arr.join(',');
    }
    if (write_users.length >0 ) {
      var write_arr = [];
      write_users.forEach(function(el){
        write_arr.push(el.id);
      });
      var write = 'write='+ write_arr.join(',');
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
    changePermissions: function(param){
      var object = this.get('model');
      var u_arr = object.get('shared_users');
      _.map(u_arr, function(el){
        if (el.id === param.name) {
          el.type = param.value;
        }
      });
      var sharing = this.shared_users_to_sharing(u_arr);
      this.store.setSharing(object, sharing);
    },
    removeUser: function(id){
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

    shareAll: function(){
      var object = this.get('model');
      var u_arr = object.get('shared_users');
      u_arr.push({
        'id': '*',
        'display_name': 'All Pithos Users',
        'type': 'read'
      });

      var onSuccess = function() {
        object.set('sharing', sharing);
      };

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      var sharing = this.shared_users_to_sharing(u_arr);
      this.store.setSharing(object, sharing).then(onSuccess, onFail); 
    },

    shareUsers: function(){
      var self = this;
      var object = this.get('model');
      var emails = this.get('emails');
      var u_arr = object.get('shared_users');
      var sharing = object.get('sharing');

      var uuid_arr = _.pluck(u_arr, 'id');


      if (!emails.trim()) { return; }

      var onSuccess = function(res) {
        self.set('emails', '');
        object.set('sharing', sharing);
      };
      
      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      this.store.user_catalogs(null, emails).then(function(res){
        if (!res.uuids) { return };
        res.members.forEach(function(el){
          var tmp = {};
          tmp.id = el.uuid;
          tmp.display_name = el.email;
          tmp.type = 'read';

          if (!(_.contains(uuid_arr, el.uuid))) {
            u_arr.push(tmp);
          } 
        });

        sharing = self.shared_users_to_sharing(u_arr);
        self.store.setSharing(object, sharing).then(onSuccess, onFail); 
 
      });

    },

    shareGroup: function(group){
      var self = this;
      var object = this.get('model');
      var u_arr = object.get('shared_users');
      var sharing = object.get('sharing');

      var onSuccess = function(res) {
        self.set('selectedGroup', null);
        object.set('sharing', sharing);
      };
      
      var onFail = function(reason){
        self.send('showActionFail', reason);
      };
    
      // if the object is already shared with this group return
      var group_arr = _.pluck(u_arr, 'display_name');
      if (_.contains(group_arr, group.get('name'))) {
        return;
      }

      u_arr.push ({
        'id': this.get('settings').get('uuid')+':'+group.get('id'), 
        'display_name': group.get('name'),
        'type': 'read'
      });

      sharing = this.shared_users_to_sharing(u_arr);
      this.store.setSharing(object, sharing).then(onSuccess, onFail); 
    }

  }
});
