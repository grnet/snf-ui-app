import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'group',
  actions: {
    createGroup: function(){

      var name = this.get('newGroup');
      var emails = this.get('emails');

      var self = this;
      
      if (!name) { return false; }
      if (!name.trim()) { return; }

      var group = this.store.createRecord('group', {
        name: name,
        id: name,   
        emails: emails,
      });

      this.set('newGroup', '');
      this.set('emails', '');
      
      var onSuccess = function(group) {
        console.log(group);
        group.reload();
        console.log('create group onSuccess');
      };
      
      var onFail = function(reason){
        console.log('createGroup',reason);
        self.send('showActionFail', reason);
      };

      group.save().then(onSuccess, onFail);
    }
  }

});
