import Ember from 'ember';
import DS from 'ember-data';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import SynnefoStore from './store/synnefo-store';

// hacky way to suitably inject momentjs in window scope
if (typeof global !== 'undefined' && global.moment) { window.moment = global.moment; }

// FF String.includes
String.prototype.includes = String.prototype.includes || String.prototype.contains;

// Object.is polyfill
if (!Object.is) {
  Object.is = function(x, y) {
    // SameValue algorithm
    if (x === y) { // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  };
}

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  ApplicationStore: SynnefoStore
});

loadInitializers(App, config.modulePrefix);

export default App;
