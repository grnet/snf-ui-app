import ObjectController from '../object';
import ResolveSubDirsMixin from '../../mixins/resolve-sub-dirs';

export default ObjectController.extend(ResolveSubDirsMixin, {
  selected: false,
  selectedDir: null,
  closeDialog: false,

  containersNoTrash: Ember.computed.filter('controllers.application.containers', function(c, index, array) {
    return c.get('name').toLowerCase() != 'trash';
  }),

  actions: {
    selectDir: function(param){
      this.set('selected', true);
      this.set('selectedDir', param);
    },
    restoreObject: function(){
      this.send('restoreObjectFromTrash', this.get('selectedDir'));
      this.set('selected', false);
      this.set('selectedDir', null);
			this.set('closeDialog', true);
    }
  }

});
