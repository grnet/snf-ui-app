import Ember from 'ember';
import DropFile from './file';


/*
 * Mixin for container objects.
 */
var DropFileActionsMixin = Ember.Mixin.create({
  dropFiles: [],

  actions: {
    'dropFileAdd': function(file, location) {
      var dropFiles = this.get("dropFiles");
      dropFiles.pushObject(DropFile.initFromFile(file, location));
    }
  }
});

/*
 * Mixin which handles drop files event and triggers dropFileAdd actions.
 */
var DropFileViewMixin = Ember.Mixin.create({
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
    this._pendingLeaves -= 1;
    if (this._pendingLeaves === 0) {
      this.set("dragActive", false);
    }
  },

  dragOver: function(e) {
    this._stopPropagation(e);
    e.preventDefault();
  },

  drop: function(e) {
    var location = this.dropFileLocation(e);
    var dt = e.dataTransfer;

    this.set("dragActive", false);
    this._stopPropagation(e);
    if (dt && dt.types.indexOf("Files") > -1) {
      var files = dt.files;
      for (var i=0; i<files.length; i++) {
        var file = files[i];
        var target = this.get("dropFileTarget") || this;
        target.send("dropFileAdd", file, location);
      }
    }
    return false;
  }
});

export {DropFileActionsMixin, DropFileViewMixin};
