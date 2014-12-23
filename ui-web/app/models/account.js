import DS from 'ember-data';

export default DS.Model.extend({
  user: DS.belongsTo("user", {async: true}),
  lastModified: DS.attr("string") // TODO: this is a date
});
