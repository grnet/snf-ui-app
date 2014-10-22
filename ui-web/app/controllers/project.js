import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['projects'],
	free_space: function() {
		var quotas = this.get('controllers.projects.quotas');
    if (quotas == undefined) {
        return "loading...";
    }

    var free_space = quotas.findBy('id', this.get('id')).get('pithos_diskspace_free');
    return free_space;
	}.property('controllers.projects.quotas')
});
