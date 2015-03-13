import Ember from 'ember';


var DropFile = Ember.Object.extend({
  status: 'pending',
  
  init: function() {
    this.set("progress", Ember.Object.create({
      'total': 1,
      'uploaded': 0
    }));
  },
  
  uploadedSize: Ember.computed.alias("progress.uploaded"),

  uploadProgress: function() {
    var progress = this.get("progress");
    var size = this.get("size");
    if (size === null) { return null; }
    if (this.get("status") === "uploaded" || size == 0) { return 100; }
    var ratio = Math.round((progress.uploaded / size) * 99);
    return ratio > 99 ? 99 : ratio;
  }.property('progress.uploaded', 'file', 'size', 'status'),

  canUpload: function() {
    return this.get("status") in {"pending": 1, "error": 1, "aborted": 1};
  }.property('status'),

  canRemove: function() {
    return this.get("status") != "uploading";
  }.property('status'),

  canAbort: function() {
    return !!this.get("xhr") && this.get("status") == "uploading";
  }.property('xhr', 'status'),

  isUploading: function() {
    return this.get("status") == "uploading";
  }.property('status'),

  abort: function() {
    this.get("xhr").abort();
  }
});


// factory method to initialize DropFile instance from an HTML5 File object.
DropFile.initFromFile = function(file, location) {
  var attrs = {}, input;
  for (var k in file) {
    if (file.hasOwnProperty(k)) {
      attrs[k] = file[k];
    }
  }
  
  if (file.isInput) {
    input = file.input;
    file.name = input.value.split(/[\/\\]/).pop();
    file.size = null;
    file.type = file.name.split(".").pop();
  }

  // required properties 
  attrs.name = file.name;
  attrs.size = file.size;
  attrs.type = file.type;
  attrs.lastModified = file.lastModified;
  attrs.file = file;
  attrs.location = location;
  return DropFile.create(attrs);
}

export default DropFile;
