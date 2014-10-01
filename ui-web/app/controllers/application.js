import Ember from 'ember';

export default Ember.Controller.extend({
    'title': function(){
        return this.get('settings').get('service_name');
    }.property(),


});
