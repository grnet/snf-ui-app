import Ember from 'ember';

export default Ember.ObjectController.extend({
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
