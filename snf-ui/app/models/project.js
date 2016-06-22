import DS from 'ember-data';
import {bytesToHuman} from 'snf-ui/snf/common';

export default DS.Model.extend({
	name: DS.attr('string'),
	homepage: DS.attr('string'),
	system_project: DS.attr('boolean', {defaultValue: false}),
  is_member: DS.attr('boolean', {defaultValue: true}),
  state: DS.attr('string'),

  human_name: function(){
    if (this.get('system_project')){
      return 'System project';
    }
    return this.get('name');
  }.property('name', 'system_project'),


	select_label: function(){
		return this.get('human_name')+'  (' + bytesToHuman(this.get('disk_free_space'))+ ' free)';
	}.property('human_name', 'disk_free_space'),

	// quotas info
	diskspace_user_usage: DS.attr('number'),
	diskspace_user_limit: DS.attr('number'),
	diskspace_project_usage: DS.attr('number'),
	diskspace_project_limit: DS.attr('number'),

	diskspace_taken_by_others: function() {
		var project_usage = this.get('diskspace_project_usage');
		var user_usage =  this.get('diskspace_user_usage');

		return project_usage - user_usage;
	}.property('diskspace_project_usage', 'diskspace_user_usage'),

	diskspace_effective_limit: function() {

		var limit = this.get('diskspace_user_limit');
		var project_limit = this.get('diskspace_project_limit');
		var taken_by_others = this.get('diskspace_taken_by_others');
		return Math.min(limit, project_limit - taken_by_others);
	}.property('diskspace_user_limit', 'diskspace_project_limit', 'diskspace_taken_by_others'),

	disk_free_space: function() {
		var limit = this.get('diskspace_effective_limit');
		var usage = this.get('diskspace_user_usage');

		if(usage > limit) {
			return 0;
		}

		return limit - usage;
	}.property('diskspace_user_usage', 'diskspace_effective_limit'),
	// If the the usage is more then the available quotas returns true
	is_overquota: function() {
		if(this.get('disk_overquota_space') > 0) {
			return true;
		}
		return false;
	}.property('disk_overquota_space'),

	disk_overquota_space: function () {
		var usage = this.get('diskspace_user_usage');
		var limit = this.get('diskspace_effective_limit');

		if(usage > limit) {
			return usage - limit;
		}

		return 0;
	}.property('diskspace_user_usage', 'diskspace_effective_limit'),


	// If the diskspace usage is more then 80% but not more then 100% returns true
	is_almost_full: function() {
		if((this.get('usage_percentage') > 80) && (this.get('usage_percentage') <= 100)) {
			return true;
		}
		return false;
	}.property('usage_percentage'),


  is_active: function() {
    return this.get('state') == "active";
  }.property('state'),

	usage_percentage: function() {
		var usage = this.get('diskspace_user_usage');
		var limit = this.get('diskspace_effective_limit');
		if(limit > usage) {
			return ((usage/limit)*100).toFixed(2);
		}
		return 100;
	}.property('diskspace_user_usage', 'diskspace_effective_limit'),
});
