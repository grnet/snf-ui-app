import Ember from 'ember';

export default Ember.ObjectController.extend({
  actions: {
    deleteGroup: function(){
      var group = this.get('model');
      group.deleteRecord();
      group.save();
    },
  },
});
