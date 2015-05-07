import ObjectPasteController from '../object/paste';

export default ObjectPasteController.extend({
  
  title: 'Move your files to',
  actionVerb: 'move',

  actions: {
    paste: function(){
      this.get('controllers.objects').send('moveObjectsTo', {selectedDir: this.get('selectedDir')});
      this.send('unSelectDir');
    }

  }

});
