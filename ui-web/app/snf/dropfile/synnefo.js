import DS from 'ember-data';
import Ember from 'ember';
import {ChunkedTransport} from './transports';
import {Uploader} from './uploaders';
import {raw as ajax} from 'ic-ajax';

var Promise = Ember.RSVP.Promise;
var all = Ember.RSVP.all;
var hash = Ember.RSVP.all;
var queue = function(generator, parallel, resolveCb=Ember.K, rejectCb=Ember.K) {
  parallel = parallel || 0;
  var resolveInc, fulfilled = Ember.A([]), rejected = Ember.A([]);

  return new Promise(function(resolve, reject) {
    var next;
    next = function(promise) {
      if (!promise || rejected.length) {
        if (rejected.length) { reject(rejected, fulfilled); return; }
        resolve(fulfilled);
        return;
      }
      promise.then(function(res) {
        fulfilled.pushObject(res);
        resolveCb(promise, res);
      }, function(res) {
        rejected.pushObject(res);
        rejectCb(promise, res);
      }).finally(function() {
        next(generator());
      });
    }.bind(this);
    next(generator());
  });
}

var SnfUploaderTransport = ChunkedTransport.extend({
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

  getHasher: function(type) {
    return asmCrypto[type.toUpperCase()]
  },

  chunkHash: function(file, position, params) {
    var bs = params.bs, blob, hasher, to;
    hasher = this.getHasher(params.hash);
    to = position + bs;
    if (to > file.size) { to = file.size; }
    blob = file.slice(position, to);

    return new Promise(function(resolve, reject) {
      var reader;
      if (file._aborted) { reject("abort"); }
      reader = new FileReader();
      reader.onload = function(e) {
        window.setTimeout(function() {
          var hash = hasher.hex(e.target.result);
          resolve({
            'buffer': e.target.result, 
            'position': position, 
            'to': to, 
            'size': to - position,
            'hash': hash
          });
        }, 5);
      }.bind(this);
      reader.readAsArrayBuffer(blob);
    }.bind(this));
  },

  fileHashmap: function(file, params, hashChunks) {
    var cursor = 0, hashes = Ember.A([]), bs = params.bs, index;
    if (hashChunks) { 
      return new Promise(function(resolve) {
        resolve(hashChunks);
      }); 
    }

    index = 0;
    return queue(function() {
      if (cursor < file.size) {
        cursor += bs;
        return this.chunkHash(file, cursor, params);
      }
      return false;
    }.bind(this));
  },

  resolveHashes: function(hashChunks, size, type, params, fileURL, containerURL) {
    var hashmap, options;
    hashmap = {
        'hashes': hashChunks.getEach("hash"),
        'bytes': size,
        'block_hash': params.hash,
        'block_size': params.bs
    }
    options = this.mergeAjaxOptions({
      url: fileURL + "?format=json&update=1&hashmap=",
      method: 'PUT',
      data: JSON.stringify(hashmap),
      headers: {'Content-Type': type}
    });

    return ajax(options).then(function(resp) {
      return {'missing': Ember.A(), 'existing': hashChunks};
    }).catch(function(err) {
      var resp, missingResp, missing = Ember.A(), existing = Ember.A();
      if (err.errorThrown !== "CONFLICT") { throw err; }
      missingResp = Ember.A(JSON.parse(err.jqXHR.responseText));
      hashChunks.forEach(function(h) {
        if (missingResp.contains(h.hash)) {
          missing.pushObject(h);
        } else {
          existing.pushObject(h);
        }
      });
      resp = {'missing': missing, 'existing': existing};
      return resp;
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
    var index = 0;
    return queue(function() {
      var chunk = missing.get(index);
      index++;
      if (!chunk) { return false; }
      if (file._aborted) { throw "abort"; }
      return this.uploadChunk(contURL, this.getArrayBuffer(file, chunk), progress);
    }.bind(this));
  },

  doUpload: function(url, files, paths, progress, options) {
    var promise, _super, chunkedPromise;
    _super = this.__nextSuper.bind(this);
    if (options.noChunked) { return _super(url, files, paths, progress, options); }

    chunkedPromise = this.doUploadChunked(url, files, paths, progress)
    promise = new Promise(function(resolve, reject) {
      chunkedPromise.catch(function(err) {
        if (err === "abort" || (err && err[0] === "abort")) {
          reject({jqXHR:{status:0}});
          return;
        }
        console.error("Chunked upload failed retrying using XHR transport", err);
        return _super(url, files, paths, progress).then(resolve, reject);
      }.bind(this)).then(resolve);
    }.bind(this));
    promise.xhr = chunkedPromise.xhr;
    return promise;
  },

  doUploadChunked: function(url, files, paths, progress, retry, hashChunks) {
    var contURL, fileURL, cont, file, path, hashmap, params, promise, onabort;
    retry = retry || 0;

    // assert single file
    if (Ember.isArray(files) && files.length > 1) { 
      Ember.assert("Single file is required", false); 
    }
    
    file = files.get(0);
    file._aborted = false;

    path = paths.get(0);

    fileURL = url;
    cont = path.split("/").splice(0, 1).join();
    contURL = url.split(path + "/" + file.name).splice(0, 1).join() + cont;
    params = this.getHashParams();
      
    promise = new Promise(function(resolve, reject) {
      var chunksTransports = {};
      onabort = function() {
        file._aborted = true;
        for (var k in chunksTransports) {
          chunksTransports[k].abort();
          reject("abort");
          return;
        }
      }

      if (!hashChunks) {
        progress({
          'total': file.size,
          'uploaded': Math.abs(file.size * 0.01), // fake 1%;
          'message': 'Computing hashes'
        });
      }

      this.fileHashmap(file, params, hashChunks).then(function(hashChunks) {
        var args = [hashChunks, file.size, file.type, params, fileURL, contURL];
        this.resolveHashes.apply(this, args).then(function(hashes) {
          var chunksProgress, chunkProgress;
          var bytesUploaded = hashes.existing.reduce(function(cur, item) {
            return cur + item.size;
          }, 0) || Math.abs(file.size * 0.01); // fake 1%;

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
            if (retry >= 1) { reject("Max chunked retries reached (5)"); return; }
            retry = retry + 1;
            this.doUploadChunked(url, files, paths, progress, retry, hashChunks).then(resolve, reject);
          }.bind(this), reject);
        }.bind(this), reject);
      }.bind(this), reject);
    }.bind(this));

    promise.xhr = { abort: onabort };
    return promise;
  }
});

var SnfUploader = Uploader.extend({
  chunkedTransportCls: SnfUploaderTransport,
  getFileUrl: function(file) {
    return this.get("storage_host") + "/" + file.get("location") + "/" + 
      file.get("name");
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


export {SnfUploader}
