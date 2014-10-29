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
      var object = this.get('model');
      var old_id = object.get('id');
      var stripped_name = this.get('new_name');

      // old_path will be used for X-Move-From Header
      var old_path = '/'+ old_id;
      var temp = old_id.split('/');
      temp.pop();
      temp.push(stripped_name);
      var that = this;

      // new_id will be used when formating the ajax url
      var new_id = temp.join('/');
      this.store.renameObject(object, old_path, new_id).then(function(){
        that.send('refreshRoute');
      });
    },

    moveToTrash: function(){
      var object = this.get('model');
      var that = this;
      this.store.moveToTrash(object).then(function(){
        that.send('refreshRoute');
      });
    },
    
    cutObject: function(){
      var object = this.get('model');
      this.set('controllers.objects.cutObject', object);
    },


  }
});
