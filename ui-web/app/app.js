import Ember from 'ember';
import DS from 'ember-data';
import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';
import config from './config/environment';
import SynnefoStore from './store/synnefo-store';

Ember.MODEL_FACTORY_INJECTIONS = true;


var App = Ember.Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver: Resolver,
  ApplicationStore: SynnefoStore
});

loadInitializers(App, config.modulePrefix);

export default App;
