import Ember from 'ember';
import {tempSetProperty} from '../snf/common';

export default Ember.ArrayController.extend({
  needs: ['application'],
  systemProject: Ember.computed.alias("controllers.application.systemProject"),
  itemController: 'container',
  queryParams: ['view', 'sortBy'],
  closeDialog: false,
  view: null,
  sortBy: 'name:desc',

  otherView: function(){
    return(this.get('view') == 'list') ? 'grid' : 'list';
  }.property('view'),


  sortFields: [
    {'value': 'name:desc', 'label': 'Sort by name (desc)'},
    {'value': 'name:asc', 'label': 'Sort by name (asc)'},
    {'value': 'count:desc', 'label': 'Sort by items (desc)'},
    {'value': 'count:asc', 'label': 'Sort by items (asc)'},
    {'value': 'bytes:desc', 'label': 'Sort by size (desc)'},
    {'value': 'bytes:asc', 'label': 'Sort by size (asc)'},
    {'value': 'last_modified:desc', 'label': 'More recent first'},
    {'value': 'last_modified:asc', 'label': 'Older first'},
 
  ],

  sorting: function(){
    return _.findWhere(this.get('sortFields'), {'value': 'name:desc'});
  }.property('sortFields'),

  sortProperties: function(){
    return ['order:asc', this.get('sortBy')];
  }.property('sortBy'),


  sortedModel: Ember.computed.sort("model", "sortProperties"),
  
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
      /*
      * hasRecordForId: Returns true if a record for a given type and ID
      * is already loaded.
      * In our case the id of a container it's its name.
      */
      var isUnique = !this.get('store').hasRecordForId('container', this.get('newName'));
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

  watchSorting: function(){
      if (this.get('sorting') ) {
        this.set("sortBy", this.get('sorting.value'));
      }
  }.observes('sorting'),

  actions: {
    validateCreate: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },

  }
});
