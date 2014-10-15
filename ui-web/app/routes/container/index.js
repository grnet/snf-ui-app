import Ember from 'ember';

export default Ember.Route.extend({
  redirect: function(){
    //http://stackoverflow.com/questions/18689446/
    this.transitionTo('objects', '');
  
  }
});
