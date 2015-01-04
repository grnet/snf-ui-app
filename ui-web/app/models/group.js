import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  users: DS.hasMany("user", {async: true}),

  uuids: function(){
    console.log('model');
    return _.map(this.get('users'), function(el){
      return el.get('uuid');
    }).join(',');
  }.property('users')
});
