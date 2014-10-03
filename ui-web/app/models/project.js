import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  homepage: DS.attr('string'),
  diskspace: DS.attr('string'),
});
