import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  objects: DS.hasMany('object', {async:true}),
});
