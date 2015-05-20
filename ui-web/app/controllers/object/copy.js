import ObjectPasteController from '../object/paste';

export default ObjectPasteController.extend({
  
  title: function(){
    return this.t('overlay.copy.title');
  }.property(),
  actionVerb: function(){
    return this.t('action_verb.copy');
  }.property(),

  actions: {
    paste: function(){
      this.get('controllers.objects').send('copyObjects', {selectedDir: this.get('selectedDir')});
      this.send('unSelectDir');
    }
  }

});
