import ObjectPasteController from 'ui-web/controllers/object/paste';
import NameMixin from 'ui-web/mixins/name';

export default ObjectPasteController.extend(NameMixin, {

  action: 'copyObjects',
  type: 'copy'
  
});
