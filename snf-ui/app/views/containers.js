import Ember from 'ember';
import {ItemsViewMixin} from 'snf-ui/mixins/items'; 
import {RefreshViewMixin} from 'snf-ui/snf/refresh';

export default Ember.View.extend(RefreshViewMixin, ItemsViewMixin, {
  classNames: ['containers'],
});
