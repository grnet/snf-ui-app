import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'object',
  hasUpPath: true,
  upPath: 'help3-copy',
  actions: {
    createDir: function(){
      var dir_name = this.get('newDir');
      
      if (!dir_name) { return false; }
      if (!dir_name.trim()) { return; }
      
      var object = this.store.createRecord('object', {
        name: this.get('upPath')+'/'+dir_name,
        content_type: 'application/directory',
      });

      var onSuccess = function(container) {
        console.log('onSuccess');
      };
      
      var onFail = function(reason){
        console.log(reason);
      };

      object.save().then(onSuccess, onFail);
    }
  }

});
