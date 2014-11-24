import DS from 'ember-data';
import Ember from 'ember';

export default DS.RESTAdapter.extend({
  headers: function(){
    return {'X-Auth-Token': this.get('settings').get('token'),
              'X-Requested-With': 'XMLHttpRequest',
              'Content-Type': 'application/json'};
  }.property(),

  host: function(){
    return this.get('settings').get('storage_host');
  }.property(),

  buildURL: function(type, id, record){
    var url = [],
        host = this.get('host');
    url.push(host);
    if (id) {
      url.push(id);
    }
    url = url.join('/');
    return url;
  },

  ajaxSuccess: function(jqXHR, jsonPayload) {

    // get all headers as a string
    var headers = jqXHR.getAllResponseHeaders();

    // put all headers that start with X-Account-Group in an array
    var group_headers_arr = headers.match(/\bX-Account-Group-\w[^\b]*?\b/g);

    var groups = [];

    if (group_headers_arr) {
      group_headers_arr.forEach(function(h){
        var obj = {};
        obj.id = h.replace('X-Account-Group-', '');
        obj.name = h.replace('X-Account-Group-', '');
        obj.users = jqXHR.getResponseHeader(h).split(',');
        groups.push(obj);
      });
    }

    jsonPayload.groups = groups;
    return jsonPayload;
  },

  createRecord: function(store, type, record) {

    var url = this.buildURL(type.typeKey)+'?update=';
    var headers = this.get('headers');

    var header = 'X-Account-Group-'+record.get('name');
    var displaynames = [];
    

    // Users is a string containing comma separated user emails.
    // These emails are pushed into displaynames array
    record.get('users').split(',').forEach(function(u){
      displaynames.push(u.trim());
    });
      

    // Then the displaynames array is used to produce the data that will
    // be sent to the user_catalogs entry point
    var data = JSON.stringify({"uuids":[], "displaynames": displaynames});


    return new Ember.RSVP.Promise(function(resolve, reject) {

      // First we get the uuids given the users emails.
      jQuery.ajax({
        type: 'POST',
        url: 'https://pithos.synnefo.live/pithos/_astakos/account/user_catalogs/',
        headers: headers,
        data: data
      }).then(function(data) {
    
        // Sample returned data is:
        // "displayname_catalog": {
        //    "user1@users.org": <uuid>, 
        //    "user2@users.org": <uuid>, 
        //  },
        //  "uuid_catalog": {}
        //  }
        var users = data.displayname_catalog;
        var uuids = [];

        for (var key in users) {
            if (users.hasOwnProperty(key)) {
                uuids.push(users[key]);
            }
        }
    
        // uuids is an array of users uuids
        headers[header] = uuids;
        
        jQuery.ajax({
          type: 'POST',
          url: url,
          dataType: 'text',
          headers: headers,
        }).then(function(data) {
          Ember.run(null, resolve, data);
        }, function(jqXHR) {
          var response = Ember.$.parseJSON(jqXHR.responseText);
          jqXHR.then = null; // tame jQuery's ill mannered promises
          Ember.run(null, reject, jqXHR);
        });

      }, function(jqXHR) {
        var response = Ember.$.parseJSON(jqXHR.responseText);
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });
    });

  },

  deleteRecord: function(store, type, record){
    var url = this.buildURL(type.typeKey)+'?update=';
    var headers = this.get('headers');

    var header = 'X-Account-Group-'+record.get('name');
    headers[header] = '~';

    return new Ember.RSVP.Promise(function(resolve, reject) {

      jQuery.ajax({
        type: 'POST',
        url: url,
        dataType: 'text',
        headers: headers,
      }).then(function(data) {
        Ember.run(null, resolve, data);
      }, function(jqXHR) {
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });
    });

  },

});

