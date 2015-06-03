import Ember from 'ember';
import ResolveSubDirsMixin from 'ui-web/mixins/resolve-sub-dirs';

export default Ember.Controller.extend(ResolveSubDirsMixin, {
  needs: ['application', 'objects', 'account/container/objects'],
  selected: false,
  selectedDir: null,
  closeDialog: false,

  account: Ember.computed.alias('controllers.account/container/objects.account'),
 
  containersNoTrash: Ember.computed.filter('controllers.application.sortedContainers', function(c) {
    return c.get('name').toLowerCase() != 'trash';
  }),

  title: function(){
    let trans = 'overlay.'+this.get('type')+'.title';
    return this.t(trans);
  }.property(),

  actionVerb: function(){
    let trans = 'action_verb.'+this.get('type');
    return this.t(trans);
  }.property(),

  actions: {
    selectDir: function(param){
      this.set('selected', true);
      this.set('selectedDir', param);
    },
    unSelectDir: function(){
      this.set('selected', false);
      this.set('selectedDir', null);
			this.set('closeDialog', true);
    },
    move: function(){
      var action = this.get('action');
      var params = {selectedDir: this.get('selectedDir')};
      if (this.get('account')) {
        params.account = this.get('account.uuid');
      };
      this.get('controllers.objects').send(action, params);
      this.send('unSelectDir');
    },
 
  }

});
