import Ember from 'ember';
import {XHRTransport, ChunkedTransport, IFRAMETransport} from './transports';


var Uploader = Ember.Object.extend({
  
  baseURL: '/upload',
  getFilesUrl: function() { return this.get("baseURL"); },
  getFileUrl: function() { return this.get("baseURL"); },

  // resolve transport based on window capabilities
  autoInitTransport: function(winObj) {
    var transportCls;
    winObj = winObj || window;

    // xhr upload
    this.xhrSupport = !!(window.ProgressEvent && window.FileReader) && 
                      window.FormData;

    // chunked transfer
    this.chunkSupport = window.Blob && (Blob.prototype.slice ||
                                        Blob.prototype.webkitSlice || 
                                        Blob.prototype.mozSlice);

    // initialize transport
    transportCls = this.get("iframeTransportCls") || IFRAMETransport;
    if (this.xhrSupport) {
      transportCls = this.get("xhrTransportCls") || XHRTransport;
      if (this.chunkSupport) {
        transportCls = this.get("chunkedTransportCls") || ChunkedTransport;
      }
      transportCls.FormData = window.FormData;
    }

    this.set('transport', transportCls.create({uploader: this}));
  },
    
  /*
   * Upload a single file. Call uploadFiles with a single element array 
   * and change upload promise to resolve the single file instead of an array.
   */
  uploadFile: function(url, file, options) {
    url = url || this.getFileUrl(file);
    return this.uploadFiles(url, Ember.A([file]), options).then(function(files) {
      return files.objectAt(0);
    }).catch(function(err) {
      throw err;
    });
  },
  
  uploadFiles: function(url, files, options) {
    var progress, transport, fileObjs, locations, args, uploadPromise, xhr;
    // init uploading state
    files.setEach("status", "uploading");
    url = url || this.getFilesUrl(files);
    
    // set progress
    progress = function(data) {
      files.forEach(function(file) { 
        file.get("progress").setProperties(data) 
      });
    }
  
    transport = this.transport;
    fileObjs = files.getEach("file");
    locations = files.getEach("location");
    args = [url, fileObjs, locations, progress, options]
    uploadPromise = transport.upload.apply(transport, args);
    xhr = uploadPromise.xhr;
    
    // inject xhr transport object in order to be able to call abort() from the
    // file context.
    if (xhr) { files.setEach("xhr", xhr); }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      uploadPromise.then(function() {
        files.setEach("status", "uploaded");
        resolve(files);
      }).catch(function(error) { 
        var status = "error";
        if (error.jqXHR && error.jqXHR.status === 0) { status = "aborted"; }
        files.setEach("status", status);
        reject(files, error);
      }).finally(function() {
        // reset xhr and progress
        files.setEach("xhr", null);
        files.setEach("progress", Ember.Object.create({}));
      });
    });
  },

});

export {Uploader};
