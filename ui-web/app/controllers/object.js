import Ember from 'ember';

export default Ember.Controller.extend({
  itemType: 'object',
  object_view: true,
  needs: ['objects', 'application'],
  loading: false,

  container_id: Ember.computed.alias('controllers.objects.container_id'),
  groups: Ember.computed.alias('controllers.application.groups'),
  current_user: Ember.computed.alias('controllers.application.currentUser'),
  gridView: Ember.computed.alias("controllers.objects.gridView"),
  listView: Ember.computed.alias("controllers.objects.listView"),
  selectedItems: Ember.computed.alias("controllers.objects.selectedItems"),

  // Allowed actions
  canRename: true,
  canDelete: true,

  canCopy: function(){
    return !this.get('trash');
  }.property('trash'),

  canMove: function(){
    return !this.get('trash');
  }.property('trash'),

  canShare: function(){
    return !this.get('trash');
  }.property('trash'),

  canDownload: function(){
    return this.get('model.is_file'); 
  }.property('model.is_file'),

  canTrash: function(){
    return !this.get('trash');
  }.property('trash'),

  canRestore: function(){
    return this.get('trash');
  }.property('trash'),

  canVersions: function(){
    return this.get('model.is_file') && !this.get('trash');
  }.property('model.is_file', 'trash'),

  isSelected: false,

  watchSelected: function(){
    var self = this;
    var o = this.get('selectedItems');
    if (this.get('isSelected')){
      o.pushObject(self);
    } else {
      o.removeObject(self);
    }
  }.observes('isSelected'),

  trash: function(){
    return this.get('container_id') == 'trash';
  }.property('container_id'),

  view_src: function(){
    var base_url = this.get('settings').get('storage_view_url');
    return base_url+'/'+this.get('model').get('id');
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
    return this.get('model.type') === 'image';
  }.property('model.type'),

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
    initAction: function(action){
      this.get('controllers.objects').send('clearSelected');
      this.set('isSelected', true);
      this.send(action);
    },

    openDelete: function(){
      this.send('showDialog', 'confirm-simple', this, this.get('model'), 'deleteObject');
    },

    openRestore: function(){
      this.send('showDialog', 'restore', 'object/restore', this.get('model'));
    },

    openVersions: function(){
      this.send('showDialog', 'versions', 'object/versions', this.get('model'));
    },

    openShare: function(){
      this.send('showDialog', 'sharing', 'object/sharing', this.get('model'));
    },

    deleteObject: function(){
      this.send('deleteObjects');
    },

    validateRename: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },

    moveToTrash: function(){
      this.send('moveObjectsToTrash');
    },

    restoreObjectFromTrash: function(selectedDir){
      this.get('controllers.objects').send('restoreObjectsFromTrash', {'selectedDir': selectedDir});
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

