import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  project: DS.belongsTo('project', {async:true}),
  objects: DS.hasMany('object', {async:true}),
  bytes: DS.attr('number', {defaultValue: 0}),
  count: DS.attr('string', {defaultValue: 0}),
  path: DS.attr('string'),
  last_modified: DS.attr('string'),
  
  order: function(){
    if (this.get('name').toLowerCase() == 'trash') {
      return 1;
    }
    return 0;
  }.property('name'),
});
