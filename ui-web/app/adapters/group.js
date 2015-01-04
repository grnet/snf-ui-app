import StorageAdapter from 'ui-web/snf/adapters/storage';
import Ember from 'ember';

export default StorageAdapter.extend({

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
        obj.uuids = jqXHR.getResponseHeader(h);
        if (obj.uuids) {
          obj.users = obj.uuids.split(',');
        } else {
          obj.users = [];
        }
        groups.push(obj);
      });
    }

    return groups;
  },

  createRecord: function(store, type, record) {

    var url = this.buildURL(type.typeKey)+'?update=';
    var user_catalogs_url = this.get('user_catalogs_url');
    var headers = this.get('headers');

    var header = 'X-Account-Group-'+record.get('name');
    headers[header] = record.get('uuids');

    return new Ember.RSVP.Promise(function(resolve, reject) {
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
  
    });
  },

  //updateRecord: function(store, type, record){
    //var url = this.buildURL(type.typeKey)+'?update=';
    //var headers = this.get('headers');

    //var header = 'X-Account-Group-'+record.get('name');
    //headers[header] = record.get('uuids');

    //return new Ember.RSVP.Promise(function(resolve, reject) {

      //jQuery.ajax({
        //type: 'POST',
        //url: url,
        //dataType: 'text',
        //headers: headers
      //}).then(function(data) {
        //Ember.run(null, resolve, data);
      //}, function(jqXHR) {
        //var response = Ember.$.parseJSON(jqXHR.responseText);
        //jqXHR.then = null; // tame jQuery's ill mannered promises
        //Ember.run(null, reject, jqXHR);
      //});
    //});

  //},


  //user_catalogs: function(uuids, emails) {

    //var user_catalogs_url = this.get('user_catalogs_url');
    //var headers = this.get('headers');

    //var uuids_arr = [];
    //var displaynames_arr = [];

    //if (uuids)  {
      //uuids.split(',').forEach(function(u){
        //uuids_arr.push(u.trim());
      //});
    //}

    //if (emails) {
      //emails.split(',').forEach(function(u){
        //displaynames_arr.push(u.trim());
      //});
    //}

    //var data = JSON.stringify({"uuids": uuids_arr, "displaynames": displaynames_arr});


    //return new Ember.RSVP.Promise(function(resolve, reject) {

      //jQuery.ajax({
        //type: 'POST',
        //url: user_catalogs_url,
        //headers: headers,
        //data: data
      //}).then(function(data) {

        //var res = {};
        //res.members = [];
        //res.uuids = '';
        //res.emails = '';
        
        //if (Object.keys(data.uuid_catalog).length>0){
          //var users = data.uuid_catalog;
          //for (var key in users) {
            //if (users.hasOwnProperty(key)) {
              //res.members.push({email: users[key], uuid: key});
            //}
          //}
        //} else if (Object.keys(data.displayname_catalog).length>0){
          //var users = data.displayname_catalog;
          //for (var key in users) {
            //if (users.hasOwnProperty(key)) {
              //res.members.push({uuid: users[key], email: key});
            //}
          //}
        //}

        //var temp_emails = [];
        //var temp_uuids = [];

        //res.members.forEach(function(m){
          //temp_emails.push(m.email);
          //temp_uuids.push(m.uuid);
        //});
        
        //res.uuids = temp_uuids.join(',');
        //res.emails = temp_emails.join(',');



        //Ember.run(null, resolve, res);
      //}, function(jqXHR) {
        //jqXHR.then = null; // tame jQuery's ill mannered promises
        //Ember.run(null, reject, jqXHR);
      //});
    //});
  //},

});

