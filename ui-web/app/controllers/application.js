import Ember from 'ember';

import ResolveSubDirsMixin from '../mixins/resolve-sub-dirs';
import {DropFileActionsMixin} from '../snf/dropfile/mixins';
import {SnfUploader} from '../snf/dropfile/synnefo';


var defaultWorkerUrl = "/static/ui/assets/workers/worker_hasher.js";
export default Ember.Controller.extend(DropFileActionsMixin, ResolveSubDirsMixin,{
  
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
			return this.get('settings').get('service_name');
	}.property(),

	currentUser: function(){
		var uuid = this.get('settings').get('uuid');
		return this.store.find('user', uuid);
	}.property(),

	projects: function() {
		return this.get('store').find('project', {mode: 'member'});
	}.property(),

  sortByContainers: ['order:asc', 'name:asc'],
  sortedContainers: Ember.computed.sort('containers', 'sortByContainers'),

  containers: function(){
    return this.get('store').find('container');
  }.property(),

  groups: function(){
    return this.get('store').find('group');
  }.property(),



});
