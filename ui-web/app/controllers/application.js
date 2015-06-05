import Ember from 'ember';

import ResolveSubDirsMixin from 'ui-web/mixins/resolve-sub-dirs';
import {DropFileActionsMixin} from 'ui-web/snf/dropfile/mixins';
import {SnfUploader} from 'ui-web/snf/dropfile/synnefo';
import {SnfAddHandlerMixin} from 'ui-web/snf/dropfile/synnefo';


var defaultWorkerUrl = "/static/ui/assets/workers/worker_hasher.js";
export default Ember.Controller.extend(DropFileActionsMixin, SnfAddHandlerMixin, ResolveSubDirsMixin,{
  containersLoading: true,

  // initialize uploader settings
  dropFileUploader: function() {
    return SnfUploader.create({
      token: this.get("settings").get("token"),
      container: this.get("container"),
      storage_host: this.get("settings").get("storage_host"),
      worker_url: this.get("settings").get("hash_worker_url") || defaultWorkerUrl
    });
  }.property(),
 
  'actions': {
    'dropFileSuccess': function() { console.log("upload success APP"); },
    'dropFileFailed': function() { console.log("upload failed APP", arguments); },
    'dropFileStarted': function() { console.log("upload started APP", arguments); },
    'handleDirClick': function(root, comp) {
      var container, path;
      root = root.split("/");
      container = root[0];
      path = root.splice(1).join("/");
      if (!path) {
        this.transitionToRoute("container", container);
      } else {
        this.transitionToRoute("objects", container, path);
      }
    },


  },

	title: function(){
			return this.get('settings.service_name');
	}.property(),

	currentUser: function(){
		var uuid = this.get('settings.uuid');
		return this.store.find('user', uuid);
	}.property(),

	projects: function() {
		return this.get('store').find('project', {mode: 'member'});
	}.property(),

  sortByContainers: ['order:asc', 'name:asc'],
  sortedContainers: Ember.computed.sort('containers', 'sortByContainers'),

  containers: function(){
    var query = {'account': this.get('settings.uuid')};
    var containers =  this.store.findQueryReloadable('container', query);
    var promiseArray = DS.PromiseArray.create({promise: containers});
    promiseArray.then(function(){
      this.set('containersLoading', false);
    }.bind(this));
    return promiseArray;

  }.property(),

  groups: function(){
    return this.get('store').find('group');
  }.property(),



});
