import Ember from 'ember';
import {tempSetProperty} from '../snf/common';

export default Ember.ArrayController.extend({
  templatePrefix: 'containers',
  itemController: 'container',
  needs: ['application'],
  container_view: true,
  systemProject: Ember.computed.alias("controllers.application.systemProject"),
  
  closeDialog: false,
  
  queryParams: ['view', 'sortBy'],
  view: 'grid',
  sortBy: 'name:asc',

  otherView: function(){
    return(this.get('view') == 'list') ? 'grid' : 'list';
  }.property('view'),


  sortFields: [
    {'value': 'name:desc', 'label': 'Sort by name Z → A'},
    {'value': 'name:asc', 'label': 'Sort by name A → Z'},
    {'value': 'count:desc', 'label': 'Sort by items ↓'},
    {'value': 'count:asc', 'label': 'Sort by items ↑'},
    {'value': 'bytes:desc', 'label': 'Sort by size ↓'},
    {'value': 'bytes:asc', 'label': 'Sort by size ↑'},
    {'value': 'last_modified:desc', 'label': 'More recent first'},
    {'value': 'last_modified:asc', 'label': 'Older first'},
 
  ],

  ths: [
    {'label': 'name', 'field': 'name'},
    {'label': ''},
    {'label': 'modified', 'field': 'last_modified'},
    {'label': 'size', 'field': 'bytes'},
    {'label': ''},
  ],


  sorting: function(){
    return _.findWhere(this.get('sortFields'), {'value': this.get('sortBy')});
  }.property('sortFields'),

  sortProperties: function(){
    return ['order:asc', this.get('sortBy')];
  }.property('sortBy'),

  sortedModel: Ember.computed.sort("model", "sortProperties"),
  
  watchSorting: function(){
      if (this.get('sorting') ) {
        this.set("sortBy", this.get('sorting.value'));
      }
  }.observes('sorting'),

 
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

  actions: {
    validateCreate: function(action) {
      var flag = 'validationOnProgress';
      this.set('actionToExec', action);
      this.set(flag, true);
    },
    sortBy: function(property){
      this.set('sortBy', property);
    },



  }
});
