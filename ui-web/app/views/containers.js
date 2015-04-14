import Ember from 'ember';
import {ItemsViewMixin} from '../mixins/items'; 

export default Ember.View.extend(ItemsViewMixin, {
  classNames: ['containers'],
});
