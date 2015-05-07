import Ember from 'ember';
import ResolveSubDirsMixin from '../../mixins/resolve-sub-dirs';

export default Ember.Controller.extend(ResolveSubDirsMixin, {
  needs: ['application', 'objects'],
  selected: false,
  selectedDir: null,
  closeDialog: false,

  containersNoTrash: Ember.computed.filter('controllers.application.containers', function(c) {
    return c.get('name').toLowerCase() != 'trash';
  }),

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
  }

});
