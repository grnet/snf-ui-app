import Ember from 'ember';

export default Ember.ArrayController.extend({
  container_id: '',
  current_path: '/accounts/',
  objectsCount: Ember.computed.alias('length')
});
