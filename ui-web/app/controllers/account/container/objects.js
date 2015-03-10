import Ember from 'ember';
import FilesListMixin from 'ui-web/mixins/shared-files-list.js';

var alias = Ember.computed.alias;

export default Ember.ArrayController.extend(FilesListMixin, {
  needs: ['account/container'],
  account: alias('controllers.account/container.account'),
  cont: alias('controllers.account/container.cont'),
  rootPath: alias('cont.name'),

  parentPath: function() {
    var path = this.get('path');
    if (!path) {
      return false;
    }
  }.property('path')
});
