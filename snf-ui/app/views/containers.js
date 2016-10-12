import Ember from 'ember';
import {ItemsViewMixin} from 'snf-ui/mixins/items'; 
import {RefreshViewMixin} from 'snf-ui/snf/refresh';

export default Ember.View.extend(RefreshViewMixin, ItemsViewMixin, {
  classNames: ['containers'],
  createNewOnKeyUp: function() {
  var self = this;
  var newKey = 78; // "n"
  $(document).keyup(function(e) {
    if(e.keyCode == newKey) {
      self.get('controller').send('showDialog', 'create-container', 'containers');
    }
  });
}.on('didInsertElement'),
});
