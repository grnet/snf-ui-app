import Ember from 'ember';
import FilesListMixin from 'ui-web/mixins/shared-files-list';

export default Ember.ArrayController.extend(FilesListMixin, {
  needs: ['account/container'],
  model: Ember.computed.alias('controllers.account/container.model'),
  account: Ember.computed.alias('controllers.account/container.account')
});
