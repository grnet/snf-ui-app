import DS from 'ember-data';

export default DS.RESTAdapter.extend({
  headers: function(){
      return {'X-Auth-Token': this.get('settings').get('token'),
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'}
  }.property(),
  host: 'https://synnefo.live/pithos/_astakos/account',
});
