import Ember from 'ember';
import ResolveSubDirsMixin from '../mixins/resolve-sub-dirs';
import {tempSetProperty} from '../snf/common';

export default Ember.ObjectController.extend(ResolveSubDirsMixin,{
  itemType: 'container',
  title: 'object controller title',
  needs: ['containers'],

  projects: Ember.computed.alias("controllers.containers.projects"),

  availableProjects: function(){
    var self = this;
    // show only projects whose free space is enough for the container
    return this.get('projects').filter(function(p){
      return self.get('model').get('bytes')< p.get('diskspace_free_space');
    });
  }.property('projects.@each'),

  selectedProject: function(){
    var project_id = this.get('model').get('project').get('id');
    return this.get('availableProjects').findBy('id', project_id) ;
  }.property('availableProjects', 'model.project'),

  actionToPerform: undefined,

  watchProject: function(){
    var sel = this.get('selectedProject');
    if (sel && this.get('model.project.id')!=sel.get('id')){
      this.send('reassignContainer', sel.get('id'));
      this.set('project', sel);
    }
  }.observes('selectedProject'),


  actions: {
    handleDirClick: function(root, comp) {
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

    deleteContainer: function(){
      var container = this.get('model');
      var self = this;
      var onSuccess = function(container) {
        console.log('deleteContainer: onSuccess');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason)
      };
      container.destroyRecord().then(onSuccess, onFail)

    },

    emptyAndDelete: function() {
      this.send('emptyContainer', true);
    },

    emptyContainer: function(delete_flag){
      var container = this.get('model');
      var self = this;

      var onSuccess = function() {
        if (delete_flag) {
          self.send('deleteContainer');
        } else {
          container.set('count',0);
          container.set('bytes',0);
          tempSetProperty(container, 'updated');
        }
      };
      var onFail = function(reason){
        self.send('showActionFail', reason)
      };
      this.store.emptyContainer('container', container).then(onSuccess, onFail);
    },

    reassignContainer: function(project_id){
      var container = this.get('model');
      var onSuccess = function() {
        console.log('reassignContainer: onSuccess');
        tempSetProperty(container, 'updated');
      };

      var onFail = function(reason){
        self.send('showActionFail', reason)
      };
      this.store.reassignContainer('container', container, project_id).then(onSuccess, onFail);
    }
  }

});
