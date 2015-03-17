import Ember from 'ember';
import StorageAdapter from 'ui-web/snf/adapters/storage';

export default StorageAdapter.extend({

  buildURL: function(type, account, id, record) {
    var url = this._super(type, account, record);
    if (id) { url = url + "/" + id; }
    url = url.replace(/([^:])\/\//g, "$1/");
    return url;
  },

  deleteRecord: function(store, type, record) {
    var account = this.get('account');
    var url = this.buildURL(type.typeKey, account, record.get('id'), record);
    var timestamp =(new Date().getTime())/1000;
    url = url+'?until='+timestamp;
    if (record.get('is_dir')){
      url = url + '&delimiter=/';
    } 
    return this.ajax(url, "DELETE");
  },
  
  findQuery: function(store, type, query) {
    var filterPath, pathQuery, container, url, headers, payload, account;
    filterPath = null;
    pathQuery = query.pathQuery === false || true;
    container = query.container || store.get('container_id') || '';
    account = query.account || this.get('account');
    url = this.buildURL(type.typeKey, account, container);
    headers = this.get('headers'); 
    
    delete query.account;
    delete query.pathQuery;
    delete query.container;
  
    if (!query.path) { query.path = '/'; }
    if (!pathQuery && query.path !== '/') {
      filterPath = query.path;
    }
    payload = this.ajax(url, 'GET', { data: query, headers: headers });
    if (filterPath) {
      return payload.then(function(payload) {
        payload = payload.filter(function(obj) {
          return obj.name.match(new RegExp("^" + filterPath));
        });
        payload.container_id = container;
        return payload;
      });
    }

    return payload.then(function(payload) {
      payload.container_id = container;
      return payload;
    });
  },

  /**
   * Can be used for object rename, cut&paste, copy&paste, move to trash
   * 
   * @method moveObject
   * @param record {Object}
   * @param new_id {string} Desination path ex. '/trash/folder1/examplet.txt'
   * @param copy_flag {bool} If true, the object is copied instead of moved

   */

  moveObject: function(record, new_id, copy_flag) {
    var oldPath = '/'+record.get('id');
    var account = this.get('account');
    var url = this.buildURL('object', account, new_id, null);
    if (record.get('is_dir')){
      url = url+'?delimiter=/';
    }
    var headers = {};
    headers['Content-Type'] = record.get('content_type');
    headers['X-Move-From'] = oldPath;
    
    if (copy_flag === true) {
      headers['X-Copy-From'] = oldPath;
      delete headers['X-Move-From'];
    }

    headers['Accept'] =  'text/plain';
    return this.ajax(url, 'PUT', {
      headers: headers,
    });
  },

  restoreObject: function(record, version) {
    var path = '/'+record.get('id');
    var account = this.get('account');
    var url = this.buildURL('object', account, record.get('id'))+'?update=';
    var headers = {};

    headers['X-Source-Object'] = path;
    headers['X-Source-Version'] = version;
    headers['Content-Range'] = 'bytes 0-/*';
    headers['Accept'] =  'text/plain';

    return this.ajax(url, 'POST', {
      headers: headers
    });
  },

  createRecord: function(store, type, record) {
    var headers = {};
    headers['Accept'] =  'text/plain';
    headers['Content-Type'] =  record.get('content_type');

    var account = this.get('account');
    return this.ajax(this.buildURL('object', account, record.get('id')), "PUT", {
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
    var account = this.get('account');
    var url = this.buildURL('object', account, record.get('id'))+'?update=';
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
    var account = this.get('account');
    headers['X-Object-Sharing'] = sharing;
    headers['Accept'] =  'text/plain';
    
    return this.ajax(this.buildURL('object', account, record.get('id'))+'?update=', 'POST');
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
    var account = this.get('account');
    var url = this.buildURL('object', account, record.get('id'));
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
