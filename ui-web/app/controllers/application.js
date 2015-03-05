import Ember from 'ember';

import {DropFileActionsMixin} from '../snf/dropfile/mixins';
import {SnfUploader} from '../snf/dropfile/synnefo';


export default Ember.Controller.extend(DropFileActionsMixin, {
  
  // initialize uploader settings
  dropFileUploader: function() {
    return SnfUploader.create({
      token: this.get("settings").get("token"),
      container: this.get("container"),
      storage_host: this.get("settings").get("storage_host")
    });
  }.property(),
 
  'actions': {
    'dropFileSuccess': function() { console.log("upload success APP"); },
    'dropFileFailed': function() { console.log("upload failed APP", arguments); },
    'dropFileStarted': function() { console.log("upload started APP", arguments); },
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

});
