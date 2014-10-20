import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  bytes: DS.attr('number', {defaultValue: 0}),
  content_type: DS.attr('string'),
  hash: DS.attr('string'),
  x_object_uuid: DS.attr('string'),

  is_dir: function(){
    var dirs = ['application/directory', 'application/folder'];
    return (dirs.indexOf(this.get('content_type'))>-1);
  }.property('content_type'),

  stripped_name: function(){
    return this.get('name').split('/').pop();
  }.property('name'),
  
  is_img: function(){
    var imgs = ['image/jpeg', 'image/png'];
    return (imgs.indexOf(this.get('content_type'))>-1);
  }.property('content_type'),

});
