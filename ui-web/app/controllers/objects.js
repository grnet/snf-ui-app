import Ember from 'ember';

export default Ember.ArrayController.extend(DropletController, {
  itemController: 'object',

  hasUpPath: function(){
    return this.get('current_path') !== '/';
  }.property('current_path'),

  upPath: function(){
    var arr =  this.get('current_path').split('/');
    arr.pop();
    return arr.join('/');
  }.property('current_path'),

  actions: {
    createDir: function(){
      var dir_name = this.get('newDir');
      
      if (!dir_name) { return false; }
      if (!dir_name.trim()) { return; }
      
      var name = dir_name;

      if (this.get('hasUpPath')) {
        name = this.get('current_path')+'/'+ name;
      }
      
      var object = this.store.createRecord('object', {
        name: name,
        content_type: 'application/directory',
      });

      var onSuccess = function(object) {
        console.log('onSuccess');
      };
      
      var onFail = function(reason){
        console.log(reason);
      };

      object.save().then(onSuccess, onFail);
    }
  }

});
