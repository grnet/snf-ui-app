import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'group',

  actions: {
    createGroup: function(){

      var name = this.get('newName');
      var emails = this.get('newEmails');

      var self = this;
      
      if (!name.trim()) { return; }

      var onSuccess = function(group) {
          console.log('create group onSuccess');
        };
      
      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      this.set('newName', '');
      this.set('newEmails', '');
 
  
      this.store.user_catalogs(null, emails).then(function(res){

        if (!res.uuids) { return };
        
        var group = self.store.createRecord('group', {
          name: name,
          id: name,   
          uuids: res.uuids,
        });
       
        group.save().then(onSuccess, onFail);
  
      });

    }
  }

});
