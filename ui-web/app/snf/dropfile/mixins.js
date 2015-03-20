import Ember from 'ember';
import DropFile from './file';


/*
 * Mixin for container objects.
 */
var DropFileActionsMixin = Ember.Mixin.create({
  dropFiles: [],
  
  actions: {
    'dropFileAdd': function(file, location, event, source) {
      var dropFiles = this.get("dropFiles");
      var file = DropFile.initFromFile(file, location, event, source);
      dropFiles.pushObject(file);
    }
  }
});


/*
 * Mixin which handles drop files event and triggers dropFileAdd actions.
 */
var DropFileViewMixin = Ember.Mixin.create({
  excludeHidden: true,
  attributeBindings: 'draggable',
  dragActive: false,
  classNameBindings: ['dragActive:drag-active'],

  // Declare the target on which the `dropFileAdd` action will be called.
  // Usually this should be an object which is mixed using DropFileActionsMixin.
  dropFileTarget: null,
  _pendingLeaves: 0,
  
  _stopPropagation: function(e) {
    e.stopPropagation();
    if (e.preventDefault) {
      return e.preventDefault();
    } else {
      return e.returnValue = false;
    }
  },
  
  dragEnter: function(e) {
    this._stopPropagation(e);
    this._pendingLeaves += 1;
    this.set("dragActive", true);
  },

  dragLeave: function(e) {
    this._stopPropagation(e);
    this._pendingLeaves -= 1;
    if (this._pendingLeaves === 0) {
      this.set("dragActive", false);
    }
  },

  dragOver: function(e) {
    this._stopPropagation(e);
    e.preventDefault();
  },
  
  _readDir: function(entry, path, cb) {
    var dirReader, files = [], entry, file;
    dirReader = entry.createReader();
    dirReader.readEntries(function(entries) {
      for (var i=0; i<entries.length; i++) {
        entry = entries[i];
        if (entry.name == ".DS_Store") { continue; }
        if (entry.isDirectory) {
          file = new File([], entry.name);
          file.dirType = "application/directory";
          file.isDir = true;
          file._location = path;
          cb(file)
          this._readDir(entry, path + "/" + entry.name, cb);
        } else {
          entry.file(function(file) {
            file._location = path;
            cb(file);
          });
        }
      }
    }.bind(this));
    return files;
  },

  _resolveFile: function(item, cb) {
    var collected = [], entry, isDir, location, file;
    entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : item.getAsEntry();
    if (!entry.isDirectory) { entry.file(function(f){ cb(f); }); return; }

    file = new File([], entry.name);
    file._location = '';
    file.dirType = "application/directory";
    file.isDir = true;
    cb(file);

    if (entry.isDirectory) {
      this._readDir(entry, "/" + entry.name, cb);
    }
  },
  
  triggerDropFileAdd: function(file, location, sourceEvent) {
    var target = this.get("dropFileTarget") || this;
    target.send("dropFileAdd", file, location, sourceEvent, this);
  },

  drop: function(e) {
    var location, dt, types, files, file, target, item, _files, excludeHidden;
    location = this.dropFileLocation(e);
    dt = e.dataTransfer;

    this.set("dragActive", false);
    this._stopPropagation(e);
    types = dt && dt.types && Array.prototype.slice.call(dt.types);
    if (types && types.indexOf("Files") > -1) {
      files = dt.files;
      for (var i=0; i<files.length; i++) {
        file = files[i];
        item = dt.items && dt.items[i];
        excludeHidden = this.get('excludeHidden');
        if (item) {
          _files = this._resolveFile(item, function(f) {
            if (excludeHidden && f.name.match(/^\./)) {
              return;
            }
            var loc = location + (f._location || '');
            this.triggerDropFileAdd(f, loc, e);
          }.bind(this));
        } else {
          // TODO: propagate empty dir/file handling higher ??
          if (file.type == "" && file.size == 0) { continue; }
          this.triggerDropFileAdd(file, location, e);
        }
      }
    } else {
      alert("Your browser doesn't seem to support file drop uploading.");
    }
    return false;
  }
});

export {DropFileActionsMixin, DropFileViewMixin};
