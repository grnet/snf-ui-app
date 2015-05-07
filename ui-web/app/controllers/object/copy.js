import ObjectPasteController from '../object/paste';

export default ObjectPasteController.extend({
  
  title: 'Choose copy location',
  actionVerb: 'copy',

  actions: {
    paste: function(){
      this.get('controllers.objects').send('copyObjects', {selectedDir: this.get('selectedDir')});
      this.send('unSelectDir');
    }
  }

});
