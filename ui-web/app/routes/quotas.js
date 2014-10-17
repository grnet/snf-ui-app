import Ember from 'ember';

var inflector = Ember.Inflector.inflector;
inflector.irregular('quota', 'quotas');

export default Ember.Route.extend({
	model: function() {
	    return this.store.find('quota');
	}
});
