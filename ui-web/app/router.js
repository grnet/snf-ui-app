import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.resource('projects');
  this.resource('project', { path: '/projects/:project_id' });
  this.resource('containers');
  this.resource('container', { path: '/containers/:container_id'}, function(){
    this.resource('objects', { path: '/*current_path'}, function(){
      this.resource('object', function(){
        this.route('versions');
      });
    });
  });
  this.resource('quotas');
});

export default Router;
