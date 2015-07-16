import Ember from 'ember';
import {tempSetProperty} from 'ui-web/snf/common';
import {ItemsControllerMixin} from 'ui-web/mixins/items'; 


export default Ember.ArrayController.extend(ItemsControllerMixin, {
  itemType: 'objects',
  needs: ['application'],
  
  objectsCount: Ember.computed.alias('length'),
  selectedMany: Ember.computed.gt('selectedItems.length', 1),
  selectedOne: Ember.computed.equal('selectedItems.length', 1),
  hasSelected: Ember.computed.bool('selectedItems.length'),
  selectedCount: Ember.computed.alias('selectedItems.length'),
  current_user: Ember.computed.alias('controllers.application.currentUser'),
  trash: Ember.computed.equal('container_name', 'trash'),

  canDelete: true,
  canTrash: Ember.computed.not('trash'),
  canCopy: Ember.computed.not('trash'),
  canMove: Ember.computed.not('trash'),
  canUpload: Ember.computed.not('trash'),
  canCreate: Ember.computed.not('trash'),
  canRestore: Ember.computed.bool('trash'),

  objectRoute: 'objects',

  hasUpPath: function(){
    return this.get('current_path') !== '/';
  }.property('current_path'),

  view: 'list',
  sortBy: 'stripped_name:asc',

  sortFields: [
    {'value': 'stripped_name:desc', 'label': 'Sort by name Z → A'},
    {'value': 'stripped_name:asc', 'label': 'Sort by name A → Z'},
    {'value': 'type:desc', 'label': 'Sort by type Z → A'},
    {'value': 'type:asc', 'label': 'Sort by type A → Z'},
    {'value': 'size:desc', 'label': 'Sort by size (desc)'},
    {'value': 'size:asc', 'label': 'Sort by size (asc)'},
    {'value': 'last_modified:desc', 'label': 'More recent first'},
    {'value': 'last_modified:asc', 'label': 'Older first'},
 
  ],

  sortProperties: function(){
    return ['is_dir:desc', this.get('sortBy')];
  }.property('sortBy'),


  upPath: function(){
    var arr =  this.get('current_path').split('/');
    arr.pop();
    return arr.join('/');
  }.property('model.current_path'),


  path: function(){
    var url =  this.get('container_name') + '/';
    if (this.get('current_path') !== '/') {
      url = url + this.get('current_path') + '/';
    }
    return url;
  }.property('current_path', 'container_name'),

  verb_for_action: function(){
    var action = this.get('actionToPerform');
    var dict = {
      'deleteObjects': 'delete',
    };
    return dict[action];
  }.property('actionToPerform'),
  
  confirm_intro: function(){
    if (this.get('verb_for_action')) {
      var name;
      var selectedCount = this.get('selectedCount');
      var verb =  this.t('action_verb.'+this.get('verb_for_action'));
      if (this.get('selectedOne')) {
        name = this.get('selectedItems').get('firstObject').get('model.name');
      } 
      return this.t('overlay.confirm_simple.intro', selectedCount,  verb , 'object' , name);
    }
  }.property('verb_for_action', 'selectedItems.@each.model.name'),

  confirm_button: function(){
    if (this.get('verb_for_action') ) {
      return this.t('button.'+this.get('verb_for_action'));
    }
  }.property('verb_for_action'),

  selectedItems: [],
  copyFlag: false,

 /*
 * Pithos API allows the name of objects to have at most 1024 chars
 * When a new object is created the length of the name is checked
 */
  nameMaxLength: 1024,

  validInput: undefined,
  validationOnProgress: undefined,

  newName: undefined,
  actionToExec: undefined, // needs to be set when input is used (for the view)
  isUnique: undefined,
  newID: undefined,

  checkUnique: function() {
    if(this.get('newName')) {

      var temp = [];
      var name = this.get('newName');
      temp.push(this.get('container_id'));

      if (this.get('hasUpPath')) {
        temp.push(this.get('current_path'));
      }
      temp.push(name);
      var newID = temp.join('/');
      
      /*
      * hasRecordForId: Returns true if a record for a given type and ID
      * is already loaded.
      * In our case the id of a container it's its name.
      */
      var isUnique = !this.get('store').hasRecordForId('object', newID);
      this.set('newID', newID);
      this.set('isUnique', isUnique);
    }
  }.observes('newName'),

  createDir: function(){
    if(this.get('validInput')) {
      var self = this;
      var name = this.get('newName');
      if (this.get('hasUpPath')) {
        name = this.get('current_path') + '/' + name;
      }
      var id = this.get('newID');

      var object = this.store.createRecord('object', {
        id: id,
        name: name,
        content_type: 'application/directory',
        modified_by: self.get('current_user')
      });

      var onSuccess = function(object) {
        let model = self.get('model') || Ember.A();
        model.pushObject(object);
        tempSetProperty(object, 'new');
      };

      var onFail = function(reason){
        console.log('onFail');
        console.log(reason);
      };

      object.save().then(onSuccess, onFail);
      this.set('newName', undefined);
      this.set('validInput', undefined);
      this.set('isUnique', undefined);
      this.set('newID', undefined);
			this.set('closeDialog', true);
    }
  }.observes('validInput'),


  // Checks if an object with a given id exists. If it does, it returns a new 
  // unique id. If not, it returns the id.
  _verifyID: function(id){
    var self = this;
    console.log('%c edw eimaste', 'background: yellow');
    return function(id){
      var obj = self.store.getById('object',id );
      if (obj) {
        if (obj.get('is_dir') ) {
          var newname = id + '_copy';
        } else {
          var newname = id.replace(/(\..*$)/, '_copy_$1');
        }
        // if you omit return _verifyID returns undefined
        return self.get('_verifyID')(newname);
      } else {
        return id;
      }
    }
  }.property(),

  checkSelectedCls: "fa-square-o",

  watchHasSelected: function(){
    if (this.get('selectedItems.length') == 0) {
      this.set('checkSelectedCls', "fa-square-o");
    } 
  }.observes('selectedItems.@each'),

  actions: {
    reset: function() {
      Ember.sendEvent(this, "RemoveLoader", [true]);
    },
    
    uploadSuccess: function() {
      this.get('model').update();
    },

    validateCreation: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },

    _move: function(next, newID, copyFlag, source_account, callback){
      var self = this;
      var object = next.get('model');
      var newVerifiedID = self.get('_verifyID')(newID);
      if (newVerifiedID != newID){
        object._newID = newID;
        object._newVerifiedID = newVerifiedID;
        object._copyFlag = copyFlag;
        object._callback = callback;
        object._next = next;
        object._source_account = source_account
        self.send('showDialog', 'move', 'object/move' , object);
        return;
      }
      
      self.send('moveObject', object, newID, copyFlag, source_account, callback, next);
    },

    moveObject: function(object, newID, copyFlag, source_account, callback, next){
      var object = next.get('model');

      var onSuccess = function() {
        next.set('loading', false);
        this.get('model').update().then(function(){
          if (!copyFlag) {
              object.unloadRecord();
          }
        });
      }.bind(this);

      var onFail = function(reason){
        this.send('showErrorDialog', reason);
      }.bind(this);

      callback && callback();
      this.store.moveObject(object, newID, copyFlag, source_account).then(onSuccess, onFail);

      this.set('copyFlag', false);

    },

    sortBy: function(property){
      this.set('sortBy', property);
    },

    refresh: function(){
      this.set('sortBy', 'stripped_name:asc');
      this.send('refreshRoute');
    },

    toggleSelectAll: function(){
      var toggle = this.get("selectedItems.length") ? false : true;
      var cls = toggle? "fa-check-square-o": "fa-square-o";
      this.set('checkSelectedCls', cls);
      Ember.sendEvent(this, "selectAll", [toggle]);
    },

    deleteObjects: function(controller_list){
      var selected = controller_list || this.get('selectedItems');
      if (selected.length === 0) { return; }

      var onSuccess = function(a) {
        this.get('model').update().then(function(){
          a.unloadRecord();
        });
      }.bind(this);

      var onFail = function(reason){
        this.send('showErrorDialog', reason);
      }.bind(this);
      
      while (selected.get(0)) {
        var object = selected.get(0).get('model');
        selected.get(0).set('loading', true);
        selected.get(0).set('isSelected', false);
        object.deleteRecord();
        object.save().then(onSuccess, onFail);
     }
    },

    _moveObjects: function(selectedDir, controller_list, copyFlag, source_account){
      var self = this;
      var selected = controller_list || this.get('selectedItems');
      if (selected.length === 0) { return; }

      var processNext = function() {
        var next = selected.get(0);
        if (!next) { 
          return 
        }
        var object = next.get('model');
        next.set('isSelected', false);
        next.set('loading', true);
        var newID = selectedDir + '/' + object.get('stripped_name');
        var callback = processNext;
        self.send('_move', next, newID, copyFlag, source_account, callback);
      }

      var arr = selectedDir.split('/');
      var account = arr.shift();
      var container_name = arr.shift();
      var container_id = account + '/' + container_name;
      var path = arr.join('/')+'/';

      this.store.findQuery('object', {
        container_id: container_id,
        path: path
      }).then(function(){ 
        processNext();
      }, function(){
      });
    },

 
    moveObjectsToTrash: function(controller_list){
      var selectedDir = this.get('settings.uuid') + '/trash';
      this.send('_moveObjects', selectedDir, controller_list);
    },

    restoreObjectsFromTrash: function(params, controller_list){
      this.send('_moveObjects', params.selectedDir, controller_list);
    },

    copyObjects: function(params, controller_list){
      this.send('_moveObjects', params.selectedDir, controller_list, true, params.account);
   },

    moveObjectsTo: function(params, controller_list){
      this.send('_moveObjects', params.selectedDir, controller_list);
    },

    clearSelected: function(){
      var selected = this.get('selectedItems') || [];
      while (selected.get(0)) {
        selected.get(0).set('isSelected', false);
      }
    },

    openCopy: function(){
      var selected = this.get('selectedItems');
      if (selected.length === 0) { return; }
      this.send('showDialog', 'paste', 'object/copy');
    },

    openCut: function(){
      var selected = this.get('selectedItems');
      if (selected.length === 0) { return; }
      this.send('showDialog', 'paste', 'object/cut');
    },

    openDelete: function(){
      var self = this;
      var selected = this.get('selectedItems');
      if (selected.length === 0) { return; }
      this.send('showDialog', 'confirm-simple', self, null, 'deleteObjects' );
    },

    openRestore: function(){
      var selected = this.get('selectedItems');
      if (selected.length === 0) { return; }
      this.send('showDialog', 'paste', 'object/restore');
    },

  }

});
