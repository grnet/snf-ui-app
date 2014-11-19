import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['objects'],

  container_id: Ember.computed.alias('controllers.objects.container_id'),

  view_src: function(){
    var base_url = this.get('settings').get('storage_view_url');
    return base_url+this.get('model').get('id');
  }.property('model.id'),


  actions: {
    deleteObject: function(){
      var object = this.get('model');
      object.deleteRecord();
      object.save();
    },

    renameObject: function(){
      var self = this;
      var object = this.get('model');
      var old_id = object.get('id');
      var stripped_name = this.get('new_name');

      // old_path will be used for X-Move-From Header
      var old_path = '/'+ old_id;
      var temp = old_id.split('/');
      temp.pop();
      temp.push(stripped_name);

      // new_id will be used when formating the ajax url
      var new_id = temp.join('/');
      var onSuccess = function(container) {
        console.log('rename object: onSuccess');
        self.send('refreshRoute');
      };

      var onFail = function(reason){
        console.log('renameObject',reason);
        self.send('showActionFail', reason);
      };

      this.store.moveObject(object, old_path, new_id).then(onSuccess, onFail);
    },

    moveToTrash: function(){
      var object = this.get('model');
      var old_id = object.get('id');
      var old_path = '/'+ old_id;

      var new_id = 'trash/'+object.get('name');
      var self = this;

      var onSuccess = function(container) {
        console.log('move to trash: onSuccess');
        self.send('refreshRoute');
      };

      var onFail = function(reason){
        console.log('moveToTrash',reason);
        self.send('showActionFail', reason);
      };
      this.store.moveObject(object, old_path, new_id).then(onSuccess, onFail);

    },
    
    cutObject: function(){
      var object = this.get('model');
      this.set('controllers.objects.toPasteObject', object);
    },

    copyObject: function(){
      var object = this.get('model');
      this.set('controllers.objects.toPasteObject', object);
      this.set('controllers.objects.copyFlag', true);
    },


  }
});
