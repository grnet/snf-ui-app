import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['objects'],

  container_id: Ember.computed.alias('controllers.objects.container_id'),

  view_src: function(){
    var base_url = this.get('settings').get('storage_view_url');
    var container_id = this.get('container_id');
    var name = this.get('model').get('name');
    return base_url+container_id+'/'+name;
  }.property('model.name'),

  actions: {
    deleteObject: function(){
      var object = this.get('model');
      object.deleteRecord();
      object.save();
    },

    renameObject: function(){
      var object = this.get('model');
      var old_name = object.get('name');
      var stripped_name = this.get('new_name');

      // old_path will be used for X-Move-From Header
      var old_path = '/'+this.get('container_id')+'/'+old_name;
      var temp = old_name.split('/');
      temp.pop();
      temp.push(stripped_name);

      // new_name will be used when formating the ajax url
      var new_name = temp.join('/');
      this.store.renameObject(object, old_path, new_name);
    },

    downloadObject: function(version){
      alert('downloadObject action has been triggered');
    }, 

    restoreObject: function(version){
      var object = this.get('model');
      this.store.restoreObject(object, version);
    },

    moveToTrash: function(){
      var object = this.get('model');
      this.store.moveToTrash(object);

    }
  }
});
