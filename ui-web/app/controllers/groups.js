import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'group',
  actions: {
    createGroup: function(){

      var name = this.get('newGroup');
      var mails = this.get('mails');
      
      if (!name) { return false; }
      if (!name.trim()) { return; }

      var group = this.store.createRecord('group', {
        name: name,
        id: name,   
        users: mails,
      });

      this.set('newGroup', '');
      this.set('mails', '');
      
      var onSuccess = function(group) {
        console.log('onSuccess');
      };
      
      var onFail = function(reason){
        console.log(reason);
      };

      group.save().then(onSuccess, onFail);
    }
  }

});
