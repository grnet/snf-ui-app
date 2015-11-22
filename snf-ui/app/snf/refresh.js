import Ember from 'ember';

var Promise = Ember.RSVP.Promise;

// helpers copy of internal ember-data store methods
// The methods below cannot be imported from ember-data and are required 
// for _findQuery to work.
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

function serializerForAdapter(adapter, type) {
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

function _findAll(adapter, store, type, sinceToken) {
  var promise = adapter.findAll(store, type, sinceToken);
  var serializer = serializerForAdapter(adapter, type);
  var label = "DS: Handle Adapter#findAll of " + type;

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));

  return promise.then(function(adapterPayload) {
    var recordArray = store.all(type);
    store._adapterRun(function() {
      var payload = serializer.extract(store, type, adapterPayload, null, 'findAll');
      var records = store.pushMany(type, payload);
      var ids = payload.getEach("id");

      var removed = recordArray.filter(function(m) {
        return ids.indexOf(m.get('id')) === -1;
      });
      var existingIds = recordArray.getEach("id");
      var added = records.filter(function(m) {
        return existingIds.indexOf(m.get('id')) === -1;
      });
      removed.forEach(function(record) {
        record.unloadRecord();
      });
    });
    store.didUpdateAll(type);
    return recordArray;
  }, null, "DS: Extract payload of findQuery " + type);
}

function _findQuery(adapter, store, type, query, recordArray) {
  var promise = adapter.findQuery(store, type, query, recordArray);
  var serializer = serializerForAdapter(adapter, type);
  var label = "DS: Handle Adapter#findQuery of " + type;

  promise = Promise.cast(promise, label);
  promise = _guard(promise, _bind(_objectIsAlive, store));

  return promise.then(function(adapterPayload) {
    var payload = serializer.extract(store, type, adapterPayload, null, 'findQuery');

    Ember.assert("The response from a findQuery must be an Array, not " + Ember.inspect(payload), Ember.typeOf(payload) === 'array');
    
    var records = store.pushMany(type, payload);
    var ids = payload.getEach("id");
    var removed = recordArray.filter(function(m) {
      return ids.indexOf(m.get('id')) === -1;
    });
    var existingIds = recordArray.getEach("id");
    var added = records.filter(function(m) {
      return existingIds.indexOf(m.get('id')) === -1;
    });
    recordArray.removeObjects(removed);
    recordArray.pushObjects(added);
    return recordArray;
  }, null, "DS: Extract payload of findQuery " + type);
}
// end of shared methods


/*
 * A simple class which handles spawning and stopping of a list of provided 
 * task specifications in specific intervals. Task specifications are used 
 * to resolve the method/model which should be called/updated in provided 
 * intervals.
 */
var Refresher = Ember.Object.extend({
  
  timeouts: [],
  tasks: [],
  specs: {},
  context: Ember.Object.create(),
  
  init: function(specs, context, interval) {
    this.set('timeouts', []);
    this.set('specs', specs || []);
    this.set('context', context || {});
    let defaultInterval = context && 
                          context.get('settings.modelRefreshInterval');
    this.set('interval', interval || defaultInterval || 2000);
    this.set('paused', false);
  },

  parseSpec: function(spec) {
    var _spec, name, interval, callee, context, parts, lastpart, contextName;
    _spec = spec;
    spec = spec.split(":");
    name = spec[0];
    interval = '';
    if (spec.length > 1) { interval = spec[1]; }
    
    // resolve context and param|method
    parts = name.split(".");
    lastpart = name;

    context = this.get('context');

    if (parts.length > 1) {
      contextName = name;
      context = this.get('context').get(
        parts.slice(0, parts.length-1).join('.'));
      lastpart = parts[parts.length-1];
      if (parts.length > 1) {
        contextName = parts.slice(0,parts.length-1).join('.');
      } else {
        contextName = null;
      }
    }

    if (contextName) {
      context = this.get('context').get(contextName) || {};
    } else {
      context = this.get('context');
    }
    callee = (context.get ? context.get(lastpart) : null) || context[lastpart];

    if (Ember.$.isFunction(callee)) {
      callee = callee.bind(context);
    }
    
    if (interval.indexOf('@') === 0) {
      var key = interval.slice(1);
      interval = this.get('context').get(key);
      Ember.assert(this.get('context').toString() + ': Invalid interval parameter ' + key, interval);
    }
    interval = parseInt(interval);
    
    return {
      name: name,
      interval: interval || this.get('interval'),
      context: context,
      source: this.get('context').toString(),
      callee: callee,
      spec: _spec
    }
  },

  startTask: function(taskSpec, context) {
    var spec = this.parseSpec(taskSpec);
    var meta = spec.context.__refresh_meta || {deps: 0, specs: []};
    meta.specs.push(spec);
    var ids = this.get('timeouts');

    meta.deps++;
    meta.name = context.toString();
    meta.interval = meta.interval || spec.interval || this.get('interval');
    context.__refresh_meta = meta;

    // FIXME: recreate timeout if interval is less than the one already set to 
    // satisfy the shortest interval possible.
    if (meta.id) { return } 

    var self = this;
    var task = function() {
      var callee = spec.callee, query;
      
      if (!callee) { debugger }
      Ember.assert(taskSpec + " is invalid task spec", !!callee);

      if ((callee instanceof DS.PromiseArray) ||
          (callee instanceof DS.PromiseObject) ||
          (callee instanceof Ember.RSVP.Promise)) {
        if (callee.get('content') instanceof DS.RecordArray) {
          callee = callee.get('content');
        }
      }

      if (callee instanceof Ember.ComputedProperty) {
        callee = callee.get(spec.context);
      }

      if (callee instanceof DS.RecordArray) {
        callee.update();
      } else if(callee instanceof DS.Model) {
        callee.reload();
      } else {
        if (callee instanceof Function) {
          callee();
        } else {
            console.error("Inavlid callee for ", spec.spec, callee);
        }

      }
    }

    var tick = function() {
      meta.id = setTimeout(function() {
        var res;
        ids.removeObject(meta.id);
        if (meta.deps === 0) { return; }
        if (!self.get('paused')) {
          res = task();
        }
        if (res && res.then) {
          res.then(function() { tick();});
        } else { tick(); }
      }, meta.interval);
      ids.pushObject(meta.id);
    }
    tick();
  },

  stopTask: function(task, context) {
    var spec = this.parseSpec(task);
    var meta = context.__refresh_meta;
    meta.deps--;
    if (meta.deps === 0) {
      clearTimeout(meta.id);
    }
    context.__refresh_meta = meta;
  },

  start: function(spec) {
    var context = this.get('context');
    var specs = spec ? [spec] : this.get('specs');
    specs.forEach(function(spec) {
      this.startTask(spec, context);
    }.bind(this));
  },

  stop: function(spec) {
    var context = this.get('context');
    var specs = spec ? [spec] : this.get('specs');
    specs.forEach(function(spec) {
      this.stopTask(spec, context);
    }.bind(this));
  }

});


var RefreshMixin = Ember.Mixin.create({
  initRefresher: function() {
    var refresher = new Refresher(this.get('refreshTasks'), this, 
                                  this.get('refreshInterval'));
    this.set('_refresher', refresher);
  }.on('init')

});


var RefreshViewMixin = Ember.Mixin.create(RefreshMixin, {
  startRefresh: function() { this.get('_refresher').start(); }.on('didInsertElement'),
  stopRefresh: function() { this.get('_refresher').stop(); }.on('willDestroyElement'),
});


function reloadRecordArray(arr) {
  var store = arr.get('store');
  var type = arr.get('type');
  var query = arr.get('query');
  var adapter = store.adapterFor(type);
  if (query == undefined) { // findAll()
    return _findAll(adapter, store, type);
  }
  return _findQuery(adapter, store, type, query, arr); 
}


// Mark a store promise result as reloadable.
var markRefresh = function(context, method, type, query, ...args) {
  var promise, params;
  promise = context[method](type, query); // TODO: introspect return value
  promise.then(function(res) {
    res.set('query', query);
    res.update = function() { return reloadRecordArray(res); }
    return res;
  });
  return promise;
}

export {RefreshMixin, RefreshViewMixin, markRefresh}
