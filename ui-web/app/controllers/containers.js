import Ember from 'ember';

export default Ember.ArrayController.extend({
  itemController: 'container',
  projects: function(){
    return this.store.find('project');
  }.property(),
  actions: {
    createContainer: function(){
      var name = this.get('newName');
      var project = this.get('newProject');
      
      // edw to  project erxetai
      var container = this.store.createRecord('container', {
        name: name,
        project: project,
      });
      this.set('newName', '');
      this.set('newProject', '');
      container.save();
    }
  }
});
