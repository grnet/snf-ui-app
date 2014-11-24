import Ember from 'ember';

export default Ember.ObjectController.extend({
  members: function(){
    var uuids_arr = [];
    var uuids = this.get('model').get('uuids');
    console.log(uuids, '!');
    uuids.split(',').forEach(function(u){
      var m = {uuid: u, email: 'test@synnefo.org'};
      uuids_arr.push(m);
    });
    console.log(uuids_arr, '!!');
    return uuids_arr;
  }.property(),

  actions: {
    deleteGroup: function(){
	    var self = this;
      var group = this.get('model');
      var onSuccess = function(container) {
        console.log('delete group: onSuccess');
      };

      var onFail = function(reason){
        console.log('deleteGroup',reason);
        self.send('showActionFail', reason);
      };
      group.deleteRecord();
      group.save().then(onSuccess, onFail);
    },
  },
});
