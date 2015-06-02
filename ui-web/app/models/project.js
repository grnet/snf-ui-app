import DS from 'ember-data';
import {bytesToHuman} from 'ui-web/snf/common';

export default DS.Model.extend({
	name: DS.attr('string'),
	homepage: DS.attr('string'),
	system_project: DS.attr('boolean', {defaultValue: false}),

  human_name: function(){
    if (this.get('system_project')){
      return 'System project';
    }
    return this.get('name');
  }.property('name', 'system_project'),


	select_label: function(){
		return this.get('human_name')+'  (' + bytesToHuman(this.get('diskspace_free_space'))+ ' free)';
	}.property('human_name', 'diskspace_free_space'),

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

	diskspace_free_space: function() {
		var limit = this.get('diskspace_effective_limit');
		var usage = this.get('diskspace_user_usage')

		return limit - usage;
	}.property('diskspace_effective_limit')
});
