import Ember from 'ember';

export default Ember.Controller.extend({
  needs: ['object/versions'],

  view_src: Ember.computed.alias("controllers.object/versions.view_src"),

  view_src_version: function(){
    return this.get('view_src')+'?version='+this.get('model').get('id');
  }.property(),
});
