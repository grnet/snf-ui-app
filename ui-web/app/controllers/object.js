import Ember from 'ember';

export default Ember.ObjectController.extend({
  itemType: 'object',
  needs: ['objects', 'application'],

  container_id: Ember.computed.alias('controllers.objects.container_id'),
  groups: Ember.computed.alias('controllers.application.groups'),
  current_user: Ember.computed.alias('controllers.application.currentUser'),

  isSelected: false,

  trash: function(){
    return this.get('container_id') == 'trash';
  }.property('container_id'),

  view_src: function(){
    var base_url = this.get('settings').get('storage_view_url');
    return base_url+this.get('model').get('id');
  }.property('model.id'),
  
  /*
  * Pithos API allows the name of objects to have at most 1024 chars.
  * When an object is renamed the length of the new name is checked
  */
  nameMaxLength: 1024,

  validInput: undefined,
  validationOnProgress: undefined,
  resetInput: undefined,

  newName: undefined,
  actionToExec: undefined,
  isUnique: undefined,
  oldPath: undefined,
  newID: undefined,
  isImg: function() {
    return this.get('type') === 'image';
  }.property('type'),

  checkUnique: function() {
    if(this.get('newName')) {
      var type = this.get('parentController').get('model').get('type');

      var object = this.get('model');
      var oldID = object.get('id');
      var stripped_name = this.get('newName');

      // oldPath will be used for X-Move-From Header
      var oldPath = '/'+ oldID;
      var temp = oldID.split('/');
      temp.pop();
      temp.push(stripped_name);
      var newID = temp.join('/');

      /*
      * hasRecordForId: Returns true if a record for a given type and ID
      * is already loaded.
      */
      var isUnique = !this.get('store').hasRecordForId(type, newID);

      this.set('newID', newID);
      this.set('oldPath', oldPath)
      this.set('isUnique', isUnique);
    }
  }.observes('newName'),


    renameObject: function(){
      if(this.get('validInput')) {
        var oldPath = this.get('oldPath');
        var newID = this.get('newID');
        var object = this.get('model');
        var self = this;
        var onSuccess = function() {
          self.send('refreshRoute');
        };

        var onFail = function(reason){
          self.send('showActionFail', reason);
        };

      this.store.moveObject(object, newID).then(onSuccess, onFail);

      // reset
      this.set('newName', undefined);
      this.set('validInput', undefined);
      this.set('isUnique', undefined);
      this.set('oldPath', undefined);
      this.set('newID', undefined)
    }
  }.observes('validInput'),

  actions: {
    sendMany: function(action, params){
      var object_list = [];
      object_list.pushObject(this.get('model'));
      this.get('controllers.objects').send(action, object_list, params);
    },

    deleteObject: function(){
      this.send('sendMany', 'deleteObjects');
    },

    validateRename: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },

    moveToTrash: function(){
      this.send('sendMany','moveObjectsToTrash');
    },

    restoreObjectFromTrash: function(selectedDir){
      this.send('sendMany', 'restoreObjectsFromTrash', {'selectedDir': selectedDir});
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

