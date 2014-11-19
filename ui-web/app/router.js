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
  this.route('groups');

   // if the user tries to be in a route, that it doesn't exists
  this.resource('errors/404', {path: '*path'});
});

export default Router;
