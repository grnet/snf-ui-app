import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  homepage: DS.attr('string'),
  diskspace: DS.attr('string'),
  system_project: DS.attr('boolean', {defaultValue: false}),
  select_label: function(){
    return this.get('name')+'  ' + this.get('id');
  }.property('name', 'diskspace')
});
