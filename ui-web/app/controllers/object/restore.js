import ObjectPasteController from '../object/paste';
import ResolveSubDirsMixin from '../../mixins/resolve-sub-dirs';

export default ObjectPasteController.extend(ResolveSubDirsMixin,{

  title: function(){
    return this.t('overlay.restore.title');
  }.property(),

  actionVerb: function(){
    return this.t('action_verb.restore');
  }.property(),


  actions: {
    move: function(){
      this.get('controllers.objects').send('restoreObjectsFromTrash', {selectedDir: this.get('selectedDir')});
      this.send('unSelectDir');
    },
  }

});
