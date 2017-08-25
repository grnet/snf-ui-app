import Ember from 'ember';
import NameMixin from 'snf-ui/mixins/name';

function check_size(size, file_limit) {
  var default_limit = 1000000;
  var OPEN_FILE_LIMIT = file_limit || default_limit;
  if (size >= OPEN_FILE_LIMIT) {
    if (!confirm('The size of the file is too big. Are you sure you want to continue?')) {
      return false;
    }
  }
  return true;
}

export default Ember.Controller.extend(NameMixin, {
  itemType: 'object',
  object_view: true,
  needs: ['objects', 'application'],
  loading: false,

  closeDialog: false,

  container_id: Ember.computed.alias('parentController.container_id'),
  container_name: Ember.computed.alias('parentController.container_name'),
  groups: Ember.computed.alias('controllers.application.groups'),
  current_user: Ember.computed.alias('controllers.application.currentUser'),
  gridView: Ember.computed.alias('parentController.gridView'),
  listView: Ember.computed.alias('parentController.listView'),
  trash: Ember.computed.equal('container_name', 'trash'),
  read_only: Ember.computed.equal('model.allowed_to', 'read'),
  write_only: Ember.computed.equal('model.allowed_to', 'write'),
  mine: Ember.computed.alias('parentController.mine'),
  inherit_share: Ember.computed.alias('model.shared_ancestor_path'),
  account: Ember.computed.alias('parentController.account'),

  // Allowed actions
  // Actions that can be applied to multiple objects inherit their permissions
  // from parent controller
  canDelete: Ember.computed.alias('parentController.canDelete'),
  canMove: Ember.computed.alias('parentController.canMove'),
  canTrash: Ember.computed.alias('parentController.canTrash'),
  canRestore: Ember.computed.alias('parentController.canRestore'),
  canCopy: Ember.computed.alias('parentController.canCopy'),
  canUpload: Ember.computed.alias('parentController.canUpload'),
  canDownload: Ember.computed.bool('model.is_file'),

  // Object specific actions
  canRename: Ember.computed.alias('mine'),
  canShare: function(){
    return !this.get('trash') && this.get('mine');
  }.property('trash', 'mine'),

  canEdit: function() {
    let EDIT_TYPES = ['source code', 'text', 'stylesheet', /* ... additional editable file types ... */];
    return EDIT_TYPES.indexOf(this.get('model.type')) > -1 && !this.get('trash') && (this.get('mine') || this.get('write_only'))
  }.property('type', 'trash', 'mine', 'write_only'),

  canPreview: function() {
    let PREVIEW_TYPES = ['source code', 'text', 'stylesheet', /* ... additional editable file types ... */];
    return PREVIEW_TYPES.indexOf(this.get('model.type')) > -1
  }.property('type'),
 
  canVersions: function(){
    return this.get('model.is_file') && !this.get('trash') && this.get('mine') && this.get('versioning');
  }.property('model.is_file', 'trash', 'mine', 'versioning'),

  canReplace: function(){
    return this.get('model.is_file') && this.get('write_only');
  }.property('model.is_file', 'write_only'),

  
  
  versioning: Ember.computed.alias('parentController.versioning'),

  handleSelect: function(selected) {
    this.set('isSelected', selected);
  },

  bindToSelectAll: function() {
    var context = this.get('selectAllContext') || this.parentController;
    if (context) {
      Ember.addListener(context, "selectAll", this, this.handleSelect);
    }
  }.on('init'),

  removeLoader: function() {
    this.set('loading', false);
  },

  bindToRemoveLoader: function() {
    var context = this.parentController;
    if(context) {
      Ember.addListener(context, "RemoveLoader", this, this.removeLoader);
    }
  }.on('init'),

  destroy: function() {
    this._super();
    var context = this.get('selectAllContext') || this.parentController;
    if (context) {
      Ember.removeListener(context, "selectAll", this, this.handleSelect);
    }
  }.on('destroy'),

  isSelected: false,

  watchSelected: function(){
    var self = this;
    var o = this.get('parentController.selectedItems');
    if (this.get('isSelected')){
      o.pushObject(self);
    } else {
      o.removeObject(self);
    }
  }.observes('isSelected'),

  view_src: function(){
    var base_url = this.get('settings').get('storage_view_url');
    return base_url+'/'+this.get('model').get('id');
  }.property('model.id'),
  
  verb_for_action: function(){
    var action = this.get('actionToPerform');
    var dict = {
      'deleteObject': 'delete',
    };
    return dict[action];
  }.property('actionToPerform'),
  
  confirm_intro: function(){
    if (this.get('verb_for_action')) {
      var verb =  this.t('action_verb.'+this.get('verb_for_action'));
      var name = this.get('model.name');
      return this.t('overlay.confirm_simple.intro', 1, verb , 'object' , name);
    } 
  }.property('verb_for_action', 'model.name'),

  confirm_button: function(){
    if (this.get('verb_for_action')) {
      return this.t('button.'+this.get('verb_for_action'));
    }
  }.property('verb_form_action'),

  dirLinkRoute: function(){
    return this.get('parentController.objectRoute');
  }.property('parentController.objectRoute'),

  /*
  * Pithos API allows the name of objects to have at most 1024 chars.
  * When an object is renamed the length of the new name is checked
  */
  nameMaxLength: 1024,

  resetInput: undefined,

  newName: undefined,
  oldPath: undefined,
  newID: undefined,
  isImg: function() {
    return this.get('model.type') === 'image';
  }.property('model.type'),

  isUnique: function() {
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
      return isUnique;
    }
    else {
      return true;
    }
  }.property('newName'),

  freezeRenameObject: true,

  actions: {
    saveFile: function(file, content, callback) {
      file.update(content, callback);
    },

    initAction: function(action){
      this.get('parentController').send('clearSelected');
      this.set('isSelected', true);
      this.send(action);
    },

    openEditor: function(){
      var size = this.get('model.size');
      var file_limit = this.get('settings').get('open_file_limit');
      if (check_size(size, file_limit)) {
        this.get('model').set('readOnly', false);
        this.send('showDialog', 'editor', this, this.get('model'));
      }
    },

    openPreviewer: function(){
      var size = this.get('model.size');
      var file_limit = this.get('settings').get('open_file_limit');
      if (check_size(size, file_limit)) { 
        this.get('model').set('readOnly', true);
        this.send('showDialog', 'editor', this, this.get('model'));
      }
    },
 
    openDelete: function(){
      this.send('showDialog', 'confirm-simple', this, this.get('model'), 'deleteObject');
    },

    openVersions: function(){
      this.send('showDialog', 'versions', 'object/versions', this.get('model'));
    },

    openShare: function(){
      this.send('showDialog', 'sharing', 'object/sharing', this.get('model'));
    },

    openCopy: function(){
      this.send('showDialog', 'paste', 'object/copy');
    },

    openCut: function(){
      this.send('showDialog', 'paste', 'object/cut');
    },

    deleteObject: function(){
      this.send('deleteObjects');
      this.set('closeDialog', true);
    },

  renameObject: function(){
    if(!this.get('freezeRenameObject')) {
      var oldPath = this.get('oldPath');
      var newID = this.get('newID');
      var object = this.get('model');
      var self = this;
      var onSuccess = function() {
        var parent = this.get("parentController");
        parent.get('selectedItems').removeObject(this);
        parent && parent.get("model").update().then(function() {
          object.unloadRecord();
        });
      }.bind(this);

      var onFail = function(reason){
        self.send('showActionFail', reason);
      };

      this.store.moveObject(object, newID).then(onSuccess, onFail);

      // reset
      this.set('newName', undefined);
      this.set('oldPath', undefined);
      this.set('newID', undefined)
    }
  },





    moveToTrash: function(){
      this.send('moveObjectsToTrash');
    },
    closeDialog: function() {
      this.set('closeDialog', true);
    }
  }
});
