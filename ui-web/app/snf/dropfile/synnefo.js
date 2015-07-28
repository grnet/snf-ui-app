import DS from 'ember-data';
import Ember from 'ember';
import {ChunkedTransport} from './transports';
import {Uploader} from './uploaders';
import {raw as ajax} from 'ic-ajax';

var fmt = Ember.String.fmt;
var Promise = Ember.RSVP.Promise;
var all = Ember.RSVP.all;
var hash = Ember.RSVP.all;
var _delay = 1;

var XHRPromise = function(xhr, resolve, reject) {
  this.xhr = xhr;
  Promise.call(this, resolve, reject);
}
XHRPromise.prototype = new Promise(Ember.K);


var trimBuffer = function(array, filter) {
  if (!filter) { filter = function(c) { return c === 0 }};
  var view = new DataView(array);
  var pos = array.byteLength - 1;
  while (filter(view.getInt8(pos)) && pos > 0) {pos--;}
  if (pos === 0) { return new ArrayBuffer(0); }
  return array.slice(0, pos + 1);
}


var SnfUploaderTransport = ChunkedTransport.extend({

  hasherUrl: function() {
    return this.get("uploader.worker_url");
  }.property(),

  fileParam: 'X-Object-Data',

  ajaxOptions: { dataType: 'text' },

  ajaxHeaders: function() {
    var token = this.get('uploader').get('token');
    return {
      'X-Auth-Token': token,
      'X-Requested-With': 'XMLHttpRequest'
    };
  }.property("settings"),
  
  getHashParams: function(container) {
    return {'bs': 4194304, 'hash': 'sha256'}
  },
    
  computeHash: function(buffer, params) {
    var hasher = new window.Worker(this.get("hasherUrl"));
    return new Promise(function(resolve, reject) {
      hasher.onmessage = function(e) {
        var hash = e.data[0];
        hasher.terminate();
        resolve(hash);
      };
      hasher.onerror = function(err) { 
        hasher.terminate();
        reject(err); 
      }
      hasher.postMessage([buffer, params.hash, ""]);
    });
  },

  chunkHash: function(file, position, params) {
    var bs = params.bs, blob, to;
    to = position + bs;
    if (to > file.size) { to = file.size; }
    blob = file.slice(position, to);
    
    return new Promise(function(resolve, reject) {
      var reader;
      if (file._aborted) { reject("abort"); return; }
      reader = new FileReader();
      reader.onload = function(e) {
        try {
          var buffer = trimBuffer(e.target.result);
        } catch(err) { reject(err); }
        this.computeHash(buffer, params).then(function(hash) {
          resolve({
            'buffer': buffer,
            'position': position, 
            'to': to, 
            'size': to - position,
            'hash': hash
          });
        }.bind(this)).catch(reject);
      }.bind(this);
      reader.readAsArrayBuffer(blob);
    }.bind(this));
  },

  fileHashmap: function(file, params, hashChunks, progress) {
    var cursor = 0, hashes = Ember.A([]), bs = params.bs, index, total, 
      computed = 0, finished = 0;
    total = Math.ceil(file.size / bs);

    if (hashChunks) { 
      computed = hashChunks.length;
      return new Promise(function(resolve) {
        var msg = '';
        progress({'message': msg});
        resolve(hashChunks);
      }); 
    }

    return new Promise(function(resolve, reject) {
      async.timesLimit(total, 3, function(n, next) {
        cursor = n * bs;
        if (file._aborted) { next("abort"); return; }
        this.chunkHash(file, cursor, params).then(function(res) {
          var msg;
          finished++;
          msg = fmt('Computing hashes (%@/%@)', finished, total);
          progress({'message': msg});
          hashes[n] = res;
          setTimeout(next, _delay);
        }).catch(next);
      }.bind(this), function(err) {
        if (err) { reject(err) } else { resolve(hashes); }
      });
    }.bind(this));
  },

  resolveHashes: function(url, hashes, size, type, params) {
    var hashmap, options;

    hashmap = {
        'hashes': hashes.getEach("hash"),
        'bytes': size,
        'block_hash': params.hash,
        'block_size': params.bs
    }

    options = this.mergeAjaxOptions({
      url: url + "?format=json&update=1&hashmap=",
      method: 'PUT',
      data: JSON.stringify(hashmap),
      headers: {'Content-Type': type}
    });
    
    return ajax(options).then(function(resp) {
      return {
        'missing': Ember.A(), 
        'existing': hashes
      };
    }).catch(function(err) {
      var resp, missingResp, missing = Ember.A(), existing = Ember.A();
      if (err.errorThrown !== "CONFLICT") { throw err; }
      
      // parse missing hashes
      missingResp = Ember.A(JSON.parse(err.jqXHR.responseText));
      hashes.forEach(function(h) {
        if (missingResp.contains(h.hash)) {
          missing.pushObject(h);
        } else {
          existing.pushObject(h);
        }
      });

      return {
        'missing': missing, 
        'existing': existing
      };
    });
  },

  uploadChunk: function(contURL, chunk, progress=Ember.K) {
    var options, xhr;
    xhr = Ember.$.ajaxSettings.xhr();
    xhr.upload.onprogress = function(e) {
      var uploaded = e.loaded;
      progress({
        'chunk': chunk.position,
        'xhr': xhr,
        'total': chunk.size,
        'uploaded': uploaded,
      });
    };

    options = this.mergeAjaxOptions({
      url: contURL + "?format=json&update",
      headers: {
        'Content-Type':  "application/octet-stream"
      },
      method: 'POST',
      processData: false,
      data: chunk.buffer,
      xhr: function() { return xhr; }
    });
    return ajax(options);
  },
  
  getArrayBuffer: function(file, chunk) {
    if (!chunk) { return undefined; }
    return chunk;
  },

  uploadMissing: function(contURL, file, missing, progress) {
    return new Promise(function(resolve, reject) {
      async.timesLimit(missing.length, 3, function(n, next) {
        if (file._aborted) { next("abort"); return; }
        var chunk = missing.get(n);
        this.uploadChunk(contURL, this.getArrayBuffer(file, chunk), progress)
                         .then(function() { 
                            setTimeout(next, _delay);
                         }).catch(next);
      }.bind(this), function(err) {
        if (err) { reject(err); } else { resolve(); }
      });
    }.bind(this));
  },

  doUpload: function(url, files, paths, progress, options) {
    var promise, _super, chunkedPromise;
    _super = this.__nextSuper.bind(this);
    if (options.noChunked) { 
      return _super(url, files, paths, progress, options); 
    }

    chunkedPromise = this.doUploadChunked(url, files, paths, progress);
    return new XHRPromise(chunkedPromise.xhr, function(resolve, reject) {
      chunkedPromise.catch(function(error) {
        // distinguish between user requested abort and other server errors
        if (error && error.jqXHR && error.jqXHR.status === 0) { error= "abort"; }
        if (error === "abort" || (error && error[0] === "abort")) {
          reject({jqXHR:{status:0}});
          return;
        }
        if (error[0] && error[0].jqXHR && error[0].jqXHR.status.toString().match(/^5\d\d/)) {
          reject(error);
          return;
        }
        // TODO: make this configurable
        reject("chunked-failed");
      }.bind(this)).then(resolve);
    }.bind(this));
  },

  doUploadChunked: function(url, files, paths, progress, retry, hashChunks) {
    var contURL, fileURL, cont, file, path, args,
        hashmap, hashParams, promise, onabort, fileType, chunksTransports;

    // assert single file
    if (Ember.isArray(files) && files.length > 1) { 
      Ember.assert("Single file is required", false); 
    }
    
    file = files.get(0);
    file._aborted = false; // abort flag
    path = paths.get(0);
    
    fileType = file.type;
    if (!fileType && file.dirType) { fileType = file.dirType; }

    // resolve container/path parts
    fileURL = url;
    cont = path.split("/").splice(0, 1).join();
    contURL = url.split(path + "/" + file.name).splice(0, 1).join() + cont;

    hashParams = this.getHashParams();
    
    var xhr = {
      _id: 1,
      reject: Ember.K,
      abort: function() {
        file._aborted = true;
        for (var k in chunksTransports) {
          if (chunksTransports[k]._aborted) {
            continue;
          }
          chunksTransports[k].abort();
          chunksTransports[k]._aborted = true;
        }
        this.reject("abort");
        return;
      }
    }

    return new XHRPromise(xhr, function(resolve, reject) {
      chunksTransports = {};
      xhr.reject = reject;
      xhr._id++;

      // initialize progress status
      if (!hashChunks) {
        progress({
          'total': file.size,
          'uploaded': 0,
          'message': 'Computing hashes'
        });
      }
        
      args = [file, hashParams, hashChunks, progress];
      this.fileHashmap.apply(this, args).then(function(hashChunks) {
        args = [fileURL, hashChunks, file.size, fileType, hashParams];
        if (!retry) {
          progress({
            'total': file.size,
            'uploaded': 0,
            'message': 'Resolving missing chunks'
          });
        }

        this.resolveHashes.apply(this, args).then(function(hashes) {
          var chunksProgress, chunkProgress;
          var bytesUploaded = hashes.existing.reduce(function(cur, item) {
            return cur + item.size;
          }, 0) || 0;
          
          progress({
            'total': file.size,
            'uploaded': bytesUploaded,
            'message': '',
            '_existing': true
          });

          chunksProgress = {};
          chunkProgress = function(e) {
            var chunksTotal = 0;
            chunksProgress[e.chunk] = e.uploaded;
            chunksTransports[e.chunk] = e.xhr;
            for (var k in chunksProgress) {
              chunksTotal += chunksProgress[k];
            }
            progress({
              'total': file.size,
              'uploaded': bytesUploaded + chunksTotal
            });
          }

          if (hashes.missing.length == 0) {
            resolve(file);
            return file;
          }

          this.uploadMissing(contURL, file, hashes.missing, chunkProgress).then(function(){
            if (retry) { reject("chunk-failed"); return; }
            this.doUploadChunked(url, files, paths, progress, true, hashChunks).then(resolve, reject);
          }.bind(this), reject);
        }.bind(this), reject);
      }.bind(this), reject);
    }.bind(this));
  }
});

var SnfUploader = Uploader.extend({
  chunkedTransportCls: SnfUploaderTransport,

  getFileUrl: function(file) {
    var location = encodeURIComponent(file.get('location'))
    location = location.replace(/\%2F/gi, '/');
    var filename = encodeURIComponent(file.get('name'));
    var account = file.get('account');
    return this.get('storage_host') + '/' + account + '/' + location + '/' + filename;
  },

  processAjaxOptions: function(options) {
    if (!options.iframe) { return options; }
    options.url = options.url + "?X-Auth-Token=" + this.get('token');
    options.files.attr('X-Object-Data', 'file');
    return options;
  },

  objectParamsFromFile: function(file) {
    return {
      'id': file.location + file.name,
      'name': file.get("name"),
      'bytes': file.get("size"),
      'content_type': file.get("type")
    }
  }
});


var SnfAddHandlerMixin = Ember.Mixin.create({
  dropFileAddHandler: function(file) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      var store = this.get('store') || this.get('controller.store');
      var path = file.get('account') + "/" + file.get('path');
      
      store.findById('object', path).then(function() {
        var msg = `File ${file.get('path')}'` +
                  " already exists. Do you want to overwrite ?";
        var safe = file.get('safeOverwrite');
        if (!safe) {
          var overwrite = window.confirm(msg);
          if (overwrite) { resolve(file); return; }
        } else {
          resolve(file); return; 
        }
        
        var newname = file.get('name').replace(/(\..*$)/, '_renamed_$1');
        var rename = window.prompt("Do you want to rename?", newname);
        if (rename) {
          file.set('name', rename);
          this.dropFileAddHandler(file).then(resolve, reject);
        } else {
          reject(file);
        }
      }.bind(this)).catch(function() {
        resolve(file);
      });
    }.bind(this));
  }
});

export {SnfUploader, SnfAddHandlerMixin}
