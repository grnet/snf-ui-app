import ObjectController from '../object';
import ResolveSubDirsMixin from '../../mixins/resolve-sub-dirs';

export default ObjectController.extend(ResolveSubDirsMixin, {
  selected: false,
  selectedDir: null,

  actions: {
    selectDir: function(param){
      this.set('selected', true);
      this.set('selectedDir', param);
    },
    restoreObject: function(){
      var object = this.get('model');
      var oldPath = '/' + object.get('id');
      var newID = this.get('selectedDir') + '/' + object.get('stripped_name');
      this.store.moveObject(object, oldPath, newID);
      this.set('selected', false);
      this.set('selectedDir', null);
      object.deleteRecord();
    }
  }

});
