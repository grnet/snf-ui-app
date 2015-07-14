import Ember from 'ember';
import ResolveSubDirsMixin from 'ui-web/mixins/resolve-sub-dirs';

export default Ember.Controller.extend(ResolveSubDirsMixin, {
  needs: ['application', 'objects', 'account/container/objects'],
  selected: false,
  selectedDir: null,
  closeDialog: false,

  account: Ember.computed.alias('controllers.account/container/objects.account'),
  accountCont: Ember.computed.alias('controllers.account/container/objects'),
 
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

  selectedPath: function(){
    var dir = this.get('selectedDir');
    if (dir) {
      return dir.split('/').splice(1).join('/');
    }
  }.property('selectedDir'),

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
      var cont = this.get('controllers.objects');
      if (this.get('account')) {
        cont = this.get('accountCont');
        params.account = this.get('account.uuid');
      };

      cont.send(action, params);
      this.send('unSelectDir');
    },
 
  }

});
