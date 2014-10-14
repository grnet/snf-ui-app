import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  bytes: DS.attr('number'),
  content_type: DS.attr('string'),
  hash: DS.attr('string'),
  x_object_uuid: DS.attr('string'),

  is_dir: function(){
    return (this.get('content_type') === "application/directory");
  }.property('content_type'),

  stripped_name: function(){
    return this.get('name').split('/').pop();
  }.property('name'),

});
