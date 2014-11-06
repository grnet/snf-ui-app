import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function(){
    this.render('container');

    this.render('groups/sidebar', {
      into: 'container',
      outlet: 'sidebarGroups',
      controller: 'groups',
      model: this.store.find('group')
    });

   this.render('containers/sidebar', {
      into: 'container',
      outlet: 'sidebarContainers',
      controller: 'containers',
      model: this.store.find('container')
    });


  }
});
