import Ember from 'ember';

export default Ember.ObjectController.extend({
  _members: function(){
    var uuids = this.get('model').get('uuids');
    var that = this;

    this.store.user_catalogs(uuids).then(function(res){
      that.set('members', res);
    });
    return;
  }.property('model'),

  members: function(){
    this.get('_members');
    return []; 
  }.observes('_members').property(),

  actions: {

    deleteGroup: function(){
      var self = this;
      var group = this.get('model');
      group.set('uuids', '~');
      group.save().then(onSuccess, onFail);

      var onSuccess = function(group) {
      };

      var onFail = function(reason){
        self.send('showActionFail', reason)
      };

    },

    removeUserFromGroup: function(uuid){
      var self = this;
      var group = this.get('model');

      var uuids_arr = group.get('uuids').split(',');
      var index = uuids_arr.indexOf(uuid);
      if (index>-1) {
        uuids_arr.splice(index,1);
      }
      var uuids = '~';
      if (uuids_arr.length >0 ){
        uuids = uuids_arr.join(',');
      }
      group.set('uuids', uuids);
      group.save().then(onSuccess, onFail);

 
      var onSuccess = function(data) {
        console.log(data, 'data');
        console.log(group, 'group');
        group.refresh();
      };

      var onFail = function(reason){
        self.send('showActionFail', reason)
      };

     
    }
  },
});
