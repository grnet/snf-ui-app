import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  // uuids is a string with comma separated groups users ids
  uuids: DS.attr('string'),
  // emails is a string with comma separated groups users emails
  emails: DS.attr('string'),
});
