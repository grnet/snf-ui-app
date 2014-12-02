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
    } else {
      url.push(this.get('container_id'));
    }

    url = url.join('/');
    return url;
  },

  deleteRecord: function(store, type, record) {
    var url = this.buildURL(type.typeKey, record.get('id'), record);
    var timestamp =(new Date().getTime())/1000;
    url = url+'?until='+timestamp;
    if (record.get('is_dir')){
      url = url+'&delimiter=/';
    } 
    return this.ajax(url, "DELETE");
  },

  findQuery: function(store, type, query) {
    var container_id = store.get('container_id');
    this.set('container_id', container_id);
    return this.ajax(this.buildURL(type.typeKey), 'GET', { data: query });
  },

  /*
   * moveObject method can be used for rename object, for
   * cut & paste, for copy & paste and for move to trash
   *
  */


  /**
   * Can be used for object rename, cut&paste, copy&paste, move to trash
   * 
   * @method moveObject
   * @param record {Object}
   * @param old_path {string} Orign path ex. '/pithos/folder1/example.txt'
   * @param new_id {string} Desination path ex. '/trash/folder1/examplet.txt'
   * @param copy_flag {bool} If true, the object is copied instead of moved

   */

  moveObject: function(record, old_path, new_id, copy_flag) {
    var url = this.buildURL('object', new_id, null);
    if (record.get('is_dir')){
      url = url+'?delimiter=/';
    }
    var headers = this.get('headers');
  
    headers['Content-Type'] = record.get('content_type');
    headers['X-Move-From'] = old_path;
    
    if (copy_flag === true) {
      headers['X-Copy-From'] = old_path;
      delete headers['X-Move-From'];
    }

    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'PUT',
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

  restoreObject: function(record, version) {
    var path = '/'+record.get('id');
    var url = this.buildURL('object', record.get('id'))+'?update=';
    var headers = this.get('headers');

    headers['X-Source-Object'] = path;
    headers['X-Source-Version'] = version;
    headers['X-Content-Range'] = 'bytes 0-/*';

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

  createRecord: function(store, type, record) {
    var data = this.serialize(record, { includeId: true });
    var url = this.buildURL(type.typeKey, record.get('id'));
    var headers = this.get('headers');

    headers['Content-Type'] = record.get('content_type');

    return new Ember.RSVP.Promise(function(resolve, reject) {
        jQuery.ajax({
          type: 'PUT',
          url: url,
          // http://stackoverflow.com/questions/5061310/
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

  /**
   * 
   * setPublic method sets/unsets an object as publicly shared
   *
   * @method setPublic
   * @param record {Object}
   * @param flag {bool} If true, the object is rendered public, if false, the
   * object is rendered private.
   * @return {string} object's public url
   */


  setPublic: function(record, flag) {
    var url = this.buildURL('object', record.get('id'))+'?update=';
    var headers = this.get('headers');
    var self = this;

    headers['X-Object-Public'] = flag;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'POST',
        url: url,
        dataType: 'text',
        headers: headers,
      }).then(function(data) {
          self.getRecordInfo(record).then(function(res){
            Ember.run(null, resolve, res.x_object_public);
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

  /**
   * 
   * getRecordInfo extracts info for an object
   *
   * @method getRecordInfo
   * @param record {Object}
   * @return {object} with key/value pairs of Response Headers
   */


  getRecordInfo: function(record) {
    var url = this.buildURL('object', record.get('id'));
    var headers = this.get('headers');
    var res = {};
 
    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'HEAD',
        url: url,
        headers: headers,
        }).then(function(jqXHR, jsonPayload, request) {
          res.x_object_public = request.getResponseHeader('X-Object-Public');
          Ember.run(null, resolve, res);
        }, function(jqXHR) {
          var response = Ember.$.parseJSON(jqXHR.responseText);
          jqXHR.then = null; // tame jQuery's ill mannered promises
          Ember.run(null, reject, jqXHR);
        });
      });

  }


});
