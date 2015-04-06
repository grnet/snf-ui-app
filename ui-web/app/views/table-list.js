import Ember from 'ember';
import TableMixin from '../mixins/table';

export default Ember.View.extend( TableMixin, {
  templateName: 'table-list',
});
