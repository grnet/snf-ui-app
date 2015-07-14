import Ember from 'ember';
import StorageAdapter from 'ui-web/snf/adapters/storage';

export default StorageAdapter.extend({

  buildURL: function(type, account, id, snapshot) {
    var url = this._super(type, account, snapshot);
    if (id) { url = url + "/" + encodeURIComponent(id); }
    url = url.replace(/([^:])\/\//g, "$1/");
    return url;
  },

  deleteRecord: function(store, type, snapshot) {
    var account = this.get('account');
    var url = this.buildURL(type.typeKey, account, snapshot.id, snapshot);
    var timestamp =(new Date().getTime())/1000;
    url = url+'?until='+timestamp;
    if (snapshot.record.get('is_dir')) {
      url = url + '&delimiter=/';
    } 
    return this.ajax(url, "DELETE");
  },
    
  find: function(store, type, id, snapshot) {
    var account = snapshot && snapshot.account || this.get('account');
    return this.ajax(this.buildURL(type.typeKey, account, id), 'GET');
  },

  findQuery: function(store, type, query) {
    var filterPath, pathQuery, container, url, headers, 
        payload, account, parentURL, escapedPath;
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
    if (filterPath) { // use?
      return payload.then(function(payload) {
        payload = payload.filter(function(obj) {
          return obj.name.match(new RegExp("^" + filterPath));
        });
        payload.container_id = container;
        return payload;
      });
    }

    escapedPath = encodeURIComponent(query.path).replace(/\%2f/gi, '/');
    parentURL = (escapedPath === '/' ? url : (url + '/' + escapedPath));
    
    return new Ember.RSVP.Promise(function(resolve, reject) {
      payload.then(function(payload) {
        jQuery.ajax({
          type: 'HEAD',
          url: parentURL,
          headers: headers,
        }).then(function(jqXHR, jsonPayload, request) {
          payload.forEach(function(obj) {
            obj['x_object_shared_by'] = request.getResponseHeader('X-Object-Shared-By');
            obj['ancestor_sharing'] = request.getResponseHeader('X-Object-Sharing');
          })
          payload.set('container_id', container);
          Ember.run(null, resolve, payload);

      }, function(jqXHR) {
        var response = Ember.$.parseJSON(jqXHR.responseText);
        jqXHR.then = null; // tame jQuery's ill mannered promises
        Ember.run(null, reject, jqXHR);
      });
    });
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

  moveObject: function(snapshot, new_id, copy_flag, source_account) {
    var oldPath = '/' + snapshot.id;
    var account = this.get('account');
    var url = this.buildURL('object', account, new_id, null);

    if (snapshot.record.get('is_dir')) {
      url = url+'?delimiter=/';
    }
    var headers = {};
    headers['Content-Type'] = snapshot.attr('content_type');
    headers['X-Move-From'] = encodeURIComponent(oldPath);
    headers['Accept'] =  'text/plain';
    if (source_account) {
      headers['X-Source-Account'] = source_account;
    }
    
    if (copy_flag === true) {
      headers['X-Copy-From'] = encodeURIComponent(oldPath);
      delete headers['X-Move-From'];
    }

    return this.ajax(url, 'PUT', {
      headers: headers,
    });
  },

  restoreObject: function(snapshot, version) {
    var path = '/'+snapshot.id;
    var account = this.get('account');
    var url = this.buildURL('object', account, snapshot.id)+'?update=';
    var headers = {};

    headers['X-Source-Object'] = encodeURIComponent(path);
    headers['X-Source-Version'] = version;
    headers['Content-Range'] = 'bytes 0-/*';
    headers['Accept'] =  'text/plain';

    return this.ajax(url, 'POST', {
      headers: headers
    });
  },

  createRecord: function(store, type, snapshot) {
    var headers = {};
    headers['Accept'] =  'text/plain';
    headers['Content-Type'] =  snapshot.attr('content_type');

    var account = this.get('account');
    return this.ajax(this.buildURL('object', account, snapshot.id), "PUT", {
      headers: headers,
    });
  },

  /**
   * 
   * setPublic method sets/unsets an object as publicly shared
   *
   * @method setPublic
   * @param snapshot {Object}
   * @param flag {bool} If true, the object is rendered public, if false, the
   * object is rendered private.
   * @return {string} object's public url
   */


  setPublic: function(snapshot, flag) {
    var account = this.get('account');
    var url = this.buildURL('object', account, snapshot.id)+'?update=';
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

          self.getRecordInfo(snapshot).then(function(res){
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
   * @method setSharing
   * @param snapshot {Object}
   * @param sharing {string} A properly formated string with users/groups and 
   * their permissions(read/write)
   */
  setSharing: function(snapshot, sharing) {
    var headers = {};
    var account = this.get('account');
    var url = this.buildURL('object', account, snapshot.id)+'?update=';
    // According to the API we should send an empty X-Object-Sharing header to 
    // un-share an object. However some browsers ignore completely empty headers
    // and that is the reason we had to use the "\t" workaround
    if (sharing === "") { sharing = "\t" }
    headers['X-Object-Sharing'] = sharing;
    headers['Accept'] =  'text/plain';
    
    return this.ajax(url, 'POST', {
      headers: headers,
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
  getRecordInfo: function(snapshot) {
    var account = this.get('account');
    var url = this.buildURL('object', account, snapshot.id);
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
