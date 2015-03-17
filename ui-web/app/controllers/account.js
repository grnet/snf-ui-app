import Ember from 'ember';

export default Ember.ArrayController.extend({
  container_id: '',
  current_path: '/accounts/',
  objectsCount: Ember.computed.alias('length'),

  _resolveSubDirs: function(root) {
    var parts = root.split("/"), account, container, path, containers, query;
    if (parts.length === 1) {
      var accounts = new Ember.RSVP.Promise(function(resolve, reject) {
        this.store.find('account').then(function(accounts) {
          Ember.RSVP.all(accounts.getEach('user')).then(function(users) {
            resolve(users.map(function(user) {
              return Ember.Object.create({
                id: '/accounts/' + user.get("email"),
                name: user.get("email")
              });
            }));
          }, reject);
        }, reject);
      }.bind(this));
      return DS.PromiseArray.create({'promise': accounts});
    }

    if (parts.length === 3) {
      account = parts[2];
      containers = new Ember.RSVP.Promise(function(resolve, reject) {
        this.store.find('user', account).then(function(user) {
          this.store.find('container', {'account': user.get('id')}).then(function(conts) {
            resolve(conts.map(function(cont) {
              return Ember.Object.create({
                id: '/accounts/' + user.get('email') + '/' + cont.get('id'),
                name: cont.get('name')
              });
            }));
          }, reject);
        }.bind(this), reject);
      }.bind(this));
      return DS.PromiseArray.create({'promise': containers});
    }

    account = parts[2];
    container = parts[3];
    path = parts.splice(4).join("/");
    containers = new Ember.RSVP.Promise(function(resolve, reject) {
      this.store.find('user', account).then(function(user) {
        query = {
          'account': user.get('id'), 
          'container': container,
          'pathQuery': false,
          'path': path || null
        };
        this.store.findQuery('object', query).then(function(objects) {
          resolve(objects.filter(function(o) {
            return o.get("is_dir")
          }).map(function(o) {
            return Ember.Object.create({
              id: '/accounts/' + user.get('email') + '/' + container + '/' + o.get('name'),
              name: o.get('stripped_name')
            });
          }));
        });
      }.bind(this), reject);
    }.bind(this));
    return DS.PromiseArray.create({'promise': containers});
  },

  resolveSubDirs: function(root) {
    return this._resolveSubDirs.bind(this);
  }.property(),

  actions: {
    handleDirClick: function(root, comp) {
      var parts, container, account, path;
      parts = root.split("/");
      path = parts.splice(4).join("/");
      if (parts.length === 3) {
        this.transitionToRoute('account.container', parts[2]);
        return;
      }
      this.transitionToRoute('account.container.objects', parts[2], parts[3], path);
    }
  }

});