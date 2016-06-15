import SnfRestAdapter from 'snf-ui/snf/adapters/base';

var set = Ember.set;
var get = Ember.get;
var Promise = Ember.RSVP.Promise;

var STATE = {};

function serializerFor(container, type, defaultSerializer) {
  return container.lookup('serializer:'+type) ||
                 container.lookup('serializer:application') ||
                 container.lookup('serializer:' + defaultSerializer) ||
                 container.lookup('serializer:-default');
}

function defaultSerializer(container) {
  return container.lookup('serializer:application') ||
         container.lookup('serializer:-default');
}

function serializerForAdapter(store, adapter, type) {
  var serializer = adapter.serializer;
  var defaultSerializer = adapter.defaultSerializer;
  var container = adapter.container;

  if (container && serializer === undefined) {
    serializer = serializerFor(container, type.typeKey, defaultSerializer);
  }

  if (serializer === null || serializer === undefined) {
    serializer = {
      extract: function(store, type, payload) { return payload; }
    };
  }

  return serializer;
}

function _guard(promise, test) {
  var guarded = promise['finally'](function() {
    if (!test()) {
      guarded._subscribers.length = 0;
    }
  });

  return guarded;
}

function _objectIsAlive(object) {
  return !(Ember.get(object, "isDestroyed") || Ember.get(object, "isDestroying"));
}

function _bind(fn) {
  var args = Array.prototype.slice.call(arguments, 1);

  return function() {
    return fn.apply(undefined, args);
  };
}


/*
 * Synnefo storage API adapter.
 *
 * https://www.synnefo.org/docs/synnefo/latest/object-api-guide.html
 *
 */
export default SnfRestAdapter.extend({
  account: Ember.computed.alias('settings.uuid'),
  
  buildURL: function(type, id, snapshot) {
    var url = [];
    var host = Ember.get(this, 'host');
    var prefix = this.urlPrefix();

    if (type) { url.push(this.pathForType(type)); }

    //We might get passed in an array of ids from findMany
    //in which case we don't want to modify the url, as the
    //ids will be passed in through a query param
    if (id && !Ember.isArray(id)) { 
      url.push(encodeURIComponent(id).replace(/%2f/gi, "/")); 
    }

    if (prefix) { url.unshift(prefix); }

    url = url.join('/');
    if (!host && url) { url = '/' + url; }

    return url;
  },

  _initSinceCache: function() {
    this.set('sinceCache', {});
  }.on('init'),

  setIfModifiedSince: false,

  // Modified ajax method which handles 304 empty responses. In case of 304 
  // response payload promise gets rejected with "notmodified" argument. This 
  // is to avoid further processing of empty payload which otherwise would 
  // result in emptying the associated record array objects.
  ajax: function(url, type, options) {
    var sinceCache = this.get('sinceCache');
    var adapter = this;
    var sinceDate = (new Date()).toUTCString();
    var setIfModifiedSince = this.setIfModifiedSince;
    if (options && options.setIfModifiedSince != undefined) {
      setIfModifiedSince = options.setIfModifiedSince;
      delete options.setIfModifiedSince;
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      var hash = adapter.ajaxOptions(url, type, options);
      var rType = hash.type || "GET";
      var urlKey = rType + ":" + url;

      var lastResponseDate = sinceCache[urlKey];
      if (hash.headers && hash.headers['If-Modified-Since']) {
        delete hash.headers['If-Modified-Since'];
      }

      if (lastResponseDate) {
        hash.headers = hash.headers || {};
        if (setIfModifiedSince) {
          hash.headers['If-Modified-Since'] = sinceCache[urlKey];
        }
      }

      hash.success = function(json, textStatus, jqXHR) {
        
        if (hash.type == "GET" && setIfModifiedSince) {
          sinceCache[urlKey] = sinceDate;
        }

        if (jqXHR.status === 304) {
          Ember.run(null, reject, "notmodified");
          return [];
        }
        json = adapter.ajaxSuccess(jqXHR, json);
        if (json instanceof DS.InvalidError) {
          Ember.run(null, reject, json);
        } else {
          Ember.run(null, resolve, json);
        }
      };

      hash.error = function(jqXHR, textStatus, errorThrown) {
        Ember.run(null, reject, adapter.ajaxError(jqXHR, jqXHR.responseText, errorThrown));
      };

      Ember.$.ajax(hash);
    }, 'DS: RESTAdapter#ajax ' + type + ' to ' + url);
  },

  _finder_findAll: function(adapter, store, type, sinceToken, update) {
      var promise = adapter.findAll(store, type, sinceToken, update);
      var serializer = serializerForAdapter(store, adapter, type);
      var label = "DS: Handle Adapter#findAll of " + type;

      promise = Promise.cast(promise, label);
      promise = _guard(promise, _bind(_objectIsAlive, store));

      return promise.then(function(adapterPayload) {
        var payload = [];
        store._adapterRun(function() {
          payload = serializer.extract(store, type, adapterPayload, null, 'findAll');
          Ember.assert("The response from a findAll must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');
          store.pushMany(type, payload);
        });

        let all = store.all(type).sortBy('id');
        let updateIndex = function(el, i) {
          var newId = el['id'];
          var prevId = all[i].get('id');
          if (newId != prevId) {
            all[i].unloadRecord();
            updateIndex(el, i);
          }
        }

        if (payload.length < all.length) {
          for (var i=payload.length; i<all.length; i++) {
            all[i].unloadRecord();
          }
        }
        payload.sortBy('id').forEach(updateIndex);
        store.didUpdateAll(type);
        return store.all(type);
      }, null, "DS: Extract payload of findAll " + type).catch(function(err) {
        if (err == "notmodified") { return store.all(type); }
        throw err;
      });
  },

  _finder_findQuery: function(adapter, store, type, query, recordArray, update) {
    var promise = adapter.findQuery(store, type, query, recordArray, update);
    var serializer = serializerForAdapter(store, adapter, type);
    var label = "DS: Handle Adapter#findQuery of " + type;

    promise = Promise.cast(promise, label);
    promise = _guard(promise, _bind(_objectIsAlive, store));

    return promise.then(function(adapterPayload) {
      var payload;
      store._adapterRun(function() {
        payload = serializer.extract(store, type, adapterPayload, null, 'findQuery');
        Ember.assert("The response from a findQuery must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');
      });
      payload = payload.sortBy('id');
      
      let len = recordArray.get('length');
      if (recordArray.get('length') > 0) {
        let records = store.pushMany(type, payload).sortBy('id');
        let previous = recordArray.content.sortBy('id');

        let index = 0;
        let updateIndex = function(el, i) {
          let newId = el.get('id');
          let prevId = previous[i] && previous[i].get('id') || null;

          if (prevId == newId) { return }
          if (prevId === null || newId < prevId) {
            previous.insertAt(i, el);
            recordArray.addObject(el);
          } else {
            let removed = previous[i];
            previous.removeAt(i);
            recordArray.removeObject(removed);
            return updateIndex(el, i);
          }
        }.bind(this);

        records.forEach(updateIndex);

        if (previous.get("length") > records.get("length")) {
          for (var i=records.get("length")-1; i<previous.get("length") - 1; i++) {
            let removed = previous.pop();
            recordArray.removeObject(removed);
          }
        }
      } else {
        recordArray.load(payload);
      }

      //recordArray.set('_payload', payload.sortBy('id'));
      return recordArray;

    }, null, "DS: Extract payload of findQuery " + type).catch(function(err) {
      if (err == "notmodified") { return recordArray; }
      throw err;
    });
  },

  _finder_find: function(adapter, store, type, id, record) {
    var snapshot = record._createSnapshot();
    var promise = adapter.find(store, type, id, snapshot);
    var serializer = serializerForAdapter(store, adapter, type);
    var label = "DS: Handle Adapter#find of " + type + " with id: " + id;

    promise = Promise.cast(promise, label);
    promise = _guard(promise, _bind(_objectIsAlive, store));

    return promise.then(function(adapterPayload) {
      Ember.assert("You made a request for a " + type.typeKey + " with id " + id + ", but the adapter's response did not have any data", adapterPayload);
      return store._adapterRun(function() {
        var payload = serializer.extract(store, type, adapterPayload, id, 'find');
        return store.push(type, payload);
      });
    }, function(error) {
      var record = store.getById(type, id);
      if (record) {
        record.notFound();
        if (get(record, 'isEmpty')) {
          store.unloadRecord(record);
        }
      }
      throw error;
    }, "DS: Extract payload of '" + type + "'");
  },

  apiKey: 'storage',
  typePathMap: function() {
    return {
      'account': '',
      'container': null,
      'object': null,
      'group': this.get('settings.uuid'),
      'version': this.get('settings.uuid')
    }
  }.property('settings.uuid'),

  typeHeadersMap: {
    'account': {
      'Accept': 'text/plain'
    },
  }
});
