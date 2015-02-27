import Ember from 'ember';
import StorageAdapter from 'ui-web/snf/adapters/storage';

export default StorageAdapter.extend({

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
    var container_id = query.container_id;
    delete query.container_id;
    var url = this.buildURL(type.typeKey, container_id);
    var headers = this.get('headers'); 

    return new Ember.RSVP.Promise(function(resolve, reject) {
      jQuery.ajax({
        type: 'GET',
        url: url,
        data: query,
        dataType: 'json', 
        headers: headers,
      }).then(function(data) {
        data.container_id = container_id;
        Ember.run(null, resolve, data);
      }, function(jqXHR) {
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });

    });


  },

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
    var headers = {};
    headers['Content-Type'] = record.get('content_type');
    headers['X-Move-From'] = old_path;
    
    if (copy_flag === true) {
      headers['X-Copy-From'] = old_path;
      delete headers['X-Move-From'];
    }

    headers['Accept'] =  'text/plain';
    return this.ajax(url, 'PUT', {
      headers: headers,
    });
  },

  restoreObject: function(record, version) {
    var path = '/'+record.get('id');
    var url = this.buildURL('object', record.get('id'))+'?update=';
    var headers = this.get('headers');

    headers['X-Source-Object'] = path;
    headers['X-Source-Version'] = version;
    headers['X-Content-Range'] = 'bytes 0-/*';
    headers['Accept'] =  'text/plain';

    return this.ajax(url, 'POST');
  },

  createRecord: function(store, type, record) {
    var headers = {};
    headers['Accept'] =  'text/plain';
    headers['Content-Type'] =  record.get('content_type');

    return this.ajax(this.buildURL('object', record.get('id')), "PUT", {
      headers: headers,
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
   * setSharing method sets/unsets an object as privately shared
   *
   * @method setPublic
   * @param record {Object}
   * @param sharing {string} A properly formated string with users/groups and 
   * their permissions(read/write)
   */
  setSharing: function(record, sharing) {
    var headers = this.get('headers');
    headers['X-Object-Sharing'] = sharing;
    headers['Accept'] =  'text/plain';
    
    return this.ajax(this.buildURL('object', record.get('id'))+'?update=', 'POST');
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
