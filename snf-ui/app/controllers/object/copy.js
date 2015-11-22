import ObjectPasteController from 'snf-ui/controllers/object/paste';
import NameMixin from 'snf-ui/mixins/name';

export default ObjectPasteController.extend(NameMixin, {

  action: 'copyObjects',
  type: 'copy'
  
});
