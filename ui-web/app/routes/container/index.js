import Ember from 'ember';
import ResetScrollMixin from '../../mixins/reset-scroll';

export default Ember.Route.extend(ResetScrollMixin, {
  redirect: function(){
    //http://stackoverflow.com/questions/18689446/
    this.transitionTo('objects', '');
  
  }
});
