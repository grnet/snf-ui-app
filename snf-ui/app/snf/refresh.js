import Ember from 'ember';

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
  running: false,
  autoStart: true,
  
  init: function(specs, context, interval, autostart) {
    this.set('timeouts', []);
    this.set('specs', specs || []);
    this.set('context', context || {});
    let defaultInterval = context && 
                          context.get('settings.modelRefreshInterval');
    this.set('interval', interval || defaultInterval || 2000);
    this.set('paused', false);
    this.set('autoStart', autostart === undefined ? true : false);
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
    
    var key = context.toString() + "::" + lastpart;
    return {
      name: name,
      interval: interval || this.get('interval'),
      context: context,
      source: this.get('context').toString(),
      callee: callee,
      spec: _spec,
      key: key
    }
  },

  startTask: function(taskSpec, context) {
    var spec = this.parseSpec(taskSpec);
    var contextMeta = spec.context.__refresh_meta || Ember.Object.create();
    var newMeta = {deps: 0, specs: []};
    var meta = contextMeta.get(spec.key) || newMeta;
    
    // existing meta but callee changed. This is the case of changed path 
    // in objects controller. The meta object is preserved to the objects view 
    // but callee (view model) has changed.
    if (meta.specs.length > 0 && 
        !Object.is(spec.callee, meta.specs[0].callee)) {
      meta.disabled = true;
      meta = newMeta;
    }
    contextMeta.set(spec.key, meta);
    spec.context.__refresh_meta = contextMeta;
    meta.specs.push(spec);
    var ids = this.get('timeouts');

    meta.deps++;
    meta.name = spec.key;
    meta.interval = meta.interval || spec.interval || this.get('interval');

    // FIXME: recreate timeout if interval is less than the one already set to 
    // satisfy the shortest interval possible.
    if (meta.id) { return } 

    var self = this;
    var task = function() {
      if (window.NO_TASKS) { return; }
      var callee = spec.callee;
      
      if (!callee) { debugger }
      Ember.assert(taskSpec + " is invalid task spec", !!callee);

      if ((callee instanceof DS.PromiseArray) ||
          (callee instanceof DS.PromiseObject) ||
          (callee instanceof Ember.RSVP.Promise)) {
        if (callee.get && callee.get('content') instanceof DS.RecordArray) {
          callee = callee.get('content');
        }
      }

      if (callee instanceof Ember.ComputedProperty) {
        callee = callee.get(spec.context);
      }

      if (callee instanceof DS.RecordArray) {
        return callee.update();
      } else if(callee instanceof DS.Model) {
        return callee.reload();
      } else {
        if (callee instanceof Function) {
          return callee();
        } else {
            console.error("Inavlid callee for ", meta.spec, callee);
        }

      }
    }

    var tick = function() {
      if (meta.disabled) { return }
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
    var contextMeta = spec.context.__refresh_meta;
    if (contextMeta === undefined) { return } // stop before start???
    var meta = contextMeta.get(spec.key);
    if (!meta) { debugger; } // wtf ??
    meta.deps--;
    if (meta.deps === 0) {
      clearTimeout(meta.id);
    }
  },

  start: function(spec) {
    var context = this.get('context');
    var specs = spec ? [spec] : this.get('specs');
    specs.forEach(function(spec) {
      this.startTask(spec, context);
    }.bind(this));
    this.set("running", true);
  },

  stop: function(spec) {
    if (!this.get("running")) { return; }
    var context = this.get('context');
    var specs = spec ? [spec] : this.get('specs');
    specs.forEach(function(spec) {
      this.stopTask(spec, context);
    }.bind(this));
    this.set("running", false);
  }

});


var RefreshMixin = Ember.Mixin.create({
  initRefresher: function() {
    var refresher = new Refresher(this.get('refreshTasks'), this, 
                                  this.get('refreshInterval'),
                                  this.get('refreshAutoStart'));
    this.set('_refresher', refresher);
  }.on('init')

});


var RefreshViewMixin = Ember.Mixin.create(RefreshMixin, {
  startRefresh: function() { 
    if (this.get('_refresher.autoStart')) {
      this.get('_refresher').start(); 
    }
  }.on('didInsertElement'),
  stopRefresh: function() { 
    this.get('_refresher').stop(); 
  }.on('willDestroyElement'),
});

export {RefreshMixin, RefreshViewMixin}
