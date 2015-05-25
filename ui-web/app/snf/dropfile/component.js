import Ember from 'ember';
import DropFile from './file';

var filterBy = Ember.computed.filterBy;

export default Ember.Component.extend({

  // properties
  files: [],
  // uploader instance or class
  uploader: null,
  // automatically start uploading when file is added
  autoStartUpload: true,
  // automatically remove file when uploaded successfuly
  autoRemoveOnSuccess: false,
  // transport supports batch files upload requests
  allowMultiUpload: false,
  // the param gets passed down to transport to notify that 
  // no chunk upload method should be used
  noChunked: false,

  addResolver: null,
  
  // computed
  filesPending: filterBy('files', 'status', 'pending'),
  filesUploading: filterBy('files', 'status', 'uploading'),
  filesFailed: filterBy('files', 'status', 'error'),
  filesUploaded: filterBy('files', 'status', 'uploaded'),
  filesAborted: filterBy('files', 'status', 'aborted'),
  filesToRemove: filterBy('files', 'canRemove', true),
  filesToUpload: filterBy('files', 'canUpload', true),
  
  // methods
  initUploader: function() {
    var uploader = this.get('uploader');
    if (Ember.typeOf(uploader) == 'instance') { 
      if (!uploader.get("transport")) {
        uploader.autoInitTransport(window);
      }
      return; 
    }
    uploader = uploader.create();
    uploader.autoInitTransport(window);
    this.set('uploader', uploader);
  }.on('didInsertElement').observes('uploader'),

  // Use a custom array observer to handle add file event.
  _setFilesObserver: function() {
    var files = this.get("files");
    files.addArrayObserver({
      arrayWillChange: Ember.K,
      arrayDidChange: function(array, start, removeCount, addCount) {
        for (var i = start; i < (start + addCount); i++) {
          var item = array.get(i);
          this.trigger('fileAdd', item);
        }
      }.bind(this)
    });
  }.on("init"),
  
  _triggerAddFile: function(file) {
    var addResolver = this.get("addResolver");
    if (addResolver) { 
      addResolver(file).catch(function(err) {
        this.send("remove", file, err);
      }.bind(this)).then(function(file) {
        if (this.get("autoStartUpload")) {
          this.send('upload', file);
        }
      }.bind(this));
    }

    if (this.get("autoStartUpload")) {
      this.send('upload', file);
    }
  },

  _handleFileAdded: function(file) {  
    var handler, source = file._source;
    
    if (source && source.dropFileAddHandler) {
      handler = source.dropFileAddHandler.bind(source);
      handler(file).then(function(file) {
        this._triggerAddFile(file);
      }.bind(this)).catch(function(err) {
        this.send("remove", file, err);
      }.bind(this));
    } else {
      this._triggerAddFile(file);
    }
  }.on('fileAdd'),

  // Common helper to send actions for each file in `files` array. 
  // If `files` is set to a string, then files will be resolved from the 
  // equaly named component property.
  //
  // e.g. batchAction('filesAborted', 'remove');
  //
  batchAction: function(files, action) {
    if (!Ember.isArray(files)) {
      files = this.get(files);
    }
    
    files = files.filter(f => f);
    return files.forEach(function(file) {
      this.send(action, file);
    }.bind(this));
  },
  
  // uploader proxy methods
  uploadFile: function(file) {
    var url = this.get("url"), options ={noChunked: this.get("noChunked")};
    return this.get("uploader").uploadFile(url, file, options).then(function() {
      if (this.get("autoRemoveOnSuccess")) {
        this.send('remove', file);
      }
      return file;
    }.bind(this));
  },

  uploadFiles: function(files) {
    var url = this.get("url"), options ={noChunked: this.get("noChunked")};
    return this.get("uploader").uploadFiles(url, files, options);
  },
  

  _resolveTarget: function(obj) {
    // component
    if (obj.get("target")) { return obj.get("target"); }

    // view
    if (obj.get("controller")) { return obj.get("controller"); }

    // controller/route
    if (obj.send) { return obj; }
  },

  _sendAction: function(action, file, ...params) {
    var target;
    // trigger action for both component target and file source target 
    // in order to be able to apply specialized handlers at narrower 
    // context objects such as views/controllers of drop areas while 
    // keeping a way to declare generic handlers at higher application 
    // level (e.g. application route/controller)
    
    if (file._source) {
      action = this.get(action) || action;
      target = this._resolveTarget(file._source);
      if (action && target && target.send) { 
        try {
          target.send.apply(target, [action, file].concat(params));
        } catch(err) {};
      }
    }
    
    // FIXME: this will cause double event triggering
    this.sendAction.apply(this, [action, file].concat(params));
  },

  actions: {
    'upload': function(file) {
      this._sendAction('uploadStarted', file);
      this.uploadFile(file).then(function(file) {
        this._sendAction("uploadSuccess", file);
      }.bind(this)).catch(function(err) { 
        this._sendAction("uploadFailed", file, err) 
      }.bind(this));
    },

    'remove': function(file) {
      var files = this.get("files");
      if (files.contains(file)) {
        files.removeObject(file);
      }
    },

    'abort': function(file) {
      file.abort();
    },
    
    // batch actions
    'abortAll': function() {
      this.batchAction('filesUploading', 'abort');
    },

    'removeAll': function() {
      this.batchAction('filesToRemove', 'remove');
    },

    'uploadAll': function() {
      if (!this.get("allowMultiUpload")) {
        this.batchAction('filesToUpload', 'upload');
      } else {
        this.uploadFiles(this.get("filesToUpload"));
      }
    }
  }
});
