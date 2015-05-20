import ObjectPasteController from '../object/paste';

export default ObjectPasteController.extend({
  
  title: function(){
    return this.t('overlay.move.title');
  }.property(),
  actionVerb: function(){
    return this.t('action_verb.move');
  }.property(),

  actions: {
    paste: function(){
      this.get('controllers.objects').send('moveObjectsTo', {selectedDir: this.get('selectedDir')});
      this.send('unSelectDir');
    }

  }

});
