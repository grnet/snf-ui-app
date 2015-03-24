import Ember from 'ember';
import {tempSetProperty} from '../snf/common';

export default Ember.ArrayController.extend({
  itemController: 'container',
  sortProperties: ['order'],
  closeDialog: false,
  
  projects: function(){
    return this.store.find('project', {mode: 'member'});
  }.property(),
  
  newProject: function(){
    return this.get('systemProject');
  }.property('systemProject'),

  /*
  * Pithos API allows the name of containers to have at most 256 chars
  * When a new container is created the length of the name is checked
  */
  nameMaxLength: 256,

  validInput: undefined,
  validationOnProgress: undefined,
  newName: undefined,
  actionToExec: undefined, // needs to be set when input is used (for the view)
  isUnique: undefined,

  checkUnique: function() {
    if(this.get('newName')) {
      var type = this.get('model').get('type');
      /*
      * hasRecordForId: Returns true if a record for a given type and ID
      * is already loaded.
      * In our case the id of a container it's its name.
      */
      var isUnique = !this.get('store').hasRecordForId(type, this.get('newName'));
      this.set('isUnique', isUnique);
    }
  }.observes('newName'),

  createContainer: function(){
    if(this.get('validInput')) {
      var self = this;
      var name = this.get('newName');
      var project = this.get('newProject');
      var container = this.store.createRecord('container', {
        name: name,
        id: name,
        project: project,
      });

      var onSuccess = function(container) {
        tempSetProperty(container, 'new');
     };


      var onFail = function(reason){
        console.log('createContainer',reason);
        self.send('showActionFail', reason);
      };
      this.set('newProject', this.get('systemProject'));
      container.save().then(onSuccess, onFail);

      // reset
      this.set('newName', undefined);
      this.set('validInput', undefined);
      this.set('isUnique', undefined);
      this.set('closeDialog', true);
    }
  }.observes('validInput'),

  actions: {
    validateCreate: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },


  }
});
