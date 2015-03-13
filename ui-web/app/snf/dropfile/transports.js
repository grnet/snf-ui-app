import Ember from 'ember';
import {raw as ajax} from 'ic-ajax';

var isString = function(obj) {
  return Ember.typeOf(obj) == "string";
}

var BaseTransport = Ember.Object.extend({

  mergeAjaxOptions: function(opts) {
    var headers, options;
    headers = this.get("ajaxHeaders");
    options = this.get("ajaxOptions");
    Ember.merge(opts, options);
    
    opts.headers = opts.headers || {};
    Ember.merge(opts.headers, headers);
    return opts;
  },

  processAjaxOptions: function(opts) {
    var uploader = this.get('uploader'), args;
    args = [opts, this].concat(Array.prototype.splice.call(arguments, 1));

    if (uploader && uploader.processAjaxOptions) {
      return uploader.processAjaxOptions.apply(uploader, args);
    }
    return opts;
  },

  // to be overriden by custom uploaders.
  normalizePath: function(path) {
    return path;
  },

  upload: function(url, files, paths, progress, options) {
    var msg, filesLength, pathsLength;
    progress = progress || Ember.K;

    if (isString(paths)) {
      paths = this.normalizePath(paths);
    } else {
      msg = "Unequal files/paths length";
      filesLength = files.get("length");
      pathsLength = paths.get("length");
      Ember.assert(msg, filesLength == pathsLength);
      paths = paths.map(function(path) {
        return this.normalizePath(path);
      }.bind(this));
    }
    return this.doUpload(url, files, paths, progress, options);
  }

});


var XHRTransport = BaseTransport.extend({
  ajaxHeaders: null,
  ajaxOptions: null,

  fileParam: 'file[]',
  pathParam: 'path[]',

  getOptions: function(url, files, paths, progress) {
    var path, headers, formData, size, xhr, options;

    path = isString(paths) ? paths : null;
    headers = {};
    formData = new this.constructor.FormData();
    size = 0;

    for (var i=0; i<files.length; i++) {
      formData.append(this.get("fileParam"), files[i]);
      if (this.get("pathParam")) {
        formData.append(this.get("pathParam"), path || paths[i]);
      }
      size += files[i].size;
    }

    headers['X-File-Size'] = size;

    xhr = Ember.$.ajaxSettings.xhr();
    xhr.upload.onprogress = function(e) {
      var uploaded = e.loaded;
      progress({
        'total': size,
        'uploaded': uploaded
      });
    };

    progress({
      'total': size,
      'uploaded': 0
    });
    
    options = this.mergeAjaxOptions({
      method: 'POST',
      url: url,
      data: formData,
      headers: headers,
      processData: false,
      contentType: false,
      xhr: function() { return xhr; },
      _xhr: xhr
    });
    
    options = this.processAjaxOptions(options, url, files, paths, progress);
    return options;
  },

  doUpload: function(url, files, paths, progress, opts) {
    console.info("Uploading using xhr transport");
    var options, promise;
    options = this.getOptions(url, files, paths, progress);
    promise = ajax(options);
    promise.xhr = options._xhr;
    return promise;
  }
});


// not implemented
var ChunkedTransport = XHRTransport.extend();
var IFRAMETransport = BaseTransport.extend({
    
  doUpload: function(url, files, paths, progress, opts) {
    console.info("Uploading using iframe transport");
    var options, promise, uploader, _files, inputs;
     
    files = files.map(function(file) {
      return Ember.$(file.input);
    });
    inputs = Ember.$(files).map(function() { 
      this.show(); return this.toArray() 
    });
    
    options = this.mergeAjaxOptions({
      method: 'POST',
      url: url,
      files: inputs,
      iframe: true
    });
    
    options = this.processAjaxOptions(options, url, files, paths, 
                                      progress, opts);

    promise = ajax(options);
    promise.xhr = null;
    return promise;
  }
});

export {XHRTransport, ChunkedTransport, IFRAMETransport};
