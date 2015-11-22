import Ember from 'ember';
import DS from 'ember-data';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import SynnefoStore from './store/synnefo-store';

// hacky way to suitably inject momentjs in window scope
if (typeof global !== 'undefined' && global.moment) { window.moment = global.moment; }

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  ApplicationStore: SynnefoStore
});

loadInitializers(App, config.modulePrefix);

export default App;
