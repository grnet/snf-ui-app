import DS from 'ember-data';

export default DS.Model.extend({
	pithos_diskspace_limit: DS.attr('number'),
	pithos_diskspace_project_limit: DS.attr('number'),
	pithos_diskspace_usage: DS.attr('number'),
	pithos_diskspace_project_usage: DS.attr('number'),

	pithos_diskspace_taken_by_others:  function() {
    return Math.abs(this.get('pithos_diskspace_project_usage') - this.get('pithos_diskspace_usage'));
  }.property('pithos_diskspace_project_usage', 'pithos_diskspace_usage'),

  pithos_diskspace_effective_limit: function() {
  	var usr_limit = this.get('pithos_diskspace_limit'),
  		proj_limit = this.get('pithos_diskspace_project_limit'),
  		taken_by_others = this.get('pithos_diskspace_taken_by_others');

  	return Math.min(usr_limit, (proj_limit - taken_by_others));
  }.property('pithos_diskspace_limit', 'pithos_diskspace_project_limit', 'pithos_diskspace_taken_by_others'),

  pithos_diskspace_free: function() {
  	var usr_limit = this.get('pithos_diskspace_effective_limit'),
  		usr_usage = this.get('pithos_diskspace_usage');

		return usr_limit - usr_usage;
  }.property('pithos_diskspace_effective_limit', 'pithos_diskspace_usage')
});
