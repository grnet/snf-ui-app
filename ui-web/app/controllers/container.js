import Ember from 'ember';
import ResolveSubDirsMixin from '../mixins/resolve-sub-dirs';
import {tempSetProperty, bytesToHuman} from '../snf/common';

export default Ember.Controller.extend(ResolveSubDirsMixin,{
  itemType: 'container',
  container_view: true,
  needs: ['containers'],
  loading: false,
  closeDialog: false,

  projects: Ember.computed.alias("controllers.containers.projects"),
  gridView: Ember.computed.alias("controllers.containers.gridView"),
  listView: Ember.computed.alias("controllers.containers.listView"),
  containersModel: Ember.computed.alias("controllers.containers.model"),

  canEmpty: function(){
    return this.get('model.count') >0;
  }.property('model.count'),

  canDelete: function(){
    return !this.get('model.isTrash'); 
  }.property('model.isTrash'),

  availableProjects: function(){
    var self = this;
    // show only projects whose free space is enough for the container
    return this.get('projects').filter(function(p){
      return self.get('model').get('bytes')<= p.get('diskspace_free_space');
    });
  }.property('projects.@each'),

  selectedProject: function(){
    var project_id = this.get('model').get('project').get('id');
    return this.get('availableProjects').findBy('id', project_id) ;
  }.property('availableProjects', 'model.project'),

  actionToPerform: undefined,

  verb_for_action: function(){
    var action = this.get('actionToPerform');
    var dict = {
      'emptyAndDelete': 'delete',
      'emptyContainer': 'empty',
    };
    return dict[action];
  }.property('actionToPerform'),
  
  confirm_intro: function(){
    var verb =  this.t('action_verb.'+this.get('verb_for_action'));
    var type = this.get('itemType');
    var name = this.get('model.name');
    return this.t('overlay.confirm_simple.intro', verb , type, name);
  }.property('verb_for_action', 'model.name'),

  confirm_button: function(){
    return this.t('button.'+this.get('verb_for_action'));
  }.property('verb_form_action'),


  watchProject: function(){
    var sel = this.get('selectedProject');
    if (sel && this.get('model.project.id')!=sel.get('id')){
      this.send('reassignContainer', sel.get('id'));
      this.set('project', sel);
    }
  }.observes('selectedProject'),

	chartData: function(){
		var data = {};
		var size = this.get('bytes');
		var proj = this.get('project');
		var limit = proj.get('diskspace_effective_limit');
		var containersSize = proj.get('diskspace_user_usage');
		var othersSize = containersSize - size;
		var free = limit - containersSize;

    // sizes in bytes (int)
		data['series'] = [othersSize, size, free];
    // sizes with units
    data['seriesWithUnits'] = [bytesToHuman(othersSize), bytesToHuman(size), bytesToHuman(free)];

		var freePerCent = (free/limit*100).toFixed(2);
		var sizePerCent = (size/limit*100).toFixed(2);
		// Because we use toFixed function and these data will be displayed in a pie chart, the othersSizePerCent will be calculated as below.
		var othersSizePerCent = (100 - freePerCent - sizePerCent).toFixed(2);

		data['percent'] = [othersSizePerCent, sizePerCent, freePerCent]

		var othersLabel = 'other containers size';
		var currentLabel = this.get('name') + ' size';
		var freeLabel = 'free space size';

		data['labels'] = [othersLabel, currentLabel, freeLabel]

		return data;
	}.property('size', 'this.project.@each'),


  isEmpty: function(){
    return this.get('model.count') == 0;
  }.property('model.count'),

  isNew: function(){
    if (this.get('model.new')) {
      return 'new';
    }
  }.property('model.new'),

  isLoading: function(){
    if (this.get('loading')){
      return 'loading';
    }
  }.property('loading'),

  isTrash: function(){
    if (this.get('model.isTrash')){
      return 'is-trash';
    }; 
  }.property('model.isTrash'),



  actions: {

    deleteContainer: function(){
      this.set('closeDialog', true);
      var container = this.get('model');
      var self = this;
      self.set('loading', false);
      var containersModel = this.get('containersModel');
      var onSuccess = function(container) {
        containersModel.removeObject(container);
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

      this.set('closeDialog', true);
      this.set('loading', true);
      var onSuccess = function() {
        if (delete_flag) {
          self.send('deleteContainer');
        } else {
          container.set('count',0);
          container.set('bytes',0);
          self.set('loading', false);
        }
      };
      var onFail = function(reason){
        self.send('showActionFail', reason)
      };
      this.store.emptyContainer('container', container).then(onSuccess, onFail);
    },

    reassignContainer: function(project_id){
      var self = this;
      var container = this.get('model');
      this.set('loading', true);
      var onSuccess = function() {
        self.set('loading', false);
      };

      var onFail = function(reason){
        self.send('showActionFail', reason)
      };
      this.store.reassignContainer('container', container, project_id).then(onSuccess, onFail);
    }
  }
});
