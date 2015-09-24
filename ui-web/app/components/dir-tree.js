import Ember from 'ember';
import {RefreshViewMixin} from 'ui-web/snf/refresh';


function mergeArrayContents(base, arr) {
  base.forEach(function(el) {
    let isModel = el instanceof DS.Model;
    let remove = (isModel && !arr.contains(el)) || 
                 !!(!isModel && arr.filterBy('id', el.get('id')).length == 0);
    if (remove) { base.removeObject(el); }
  });

  arr.forEach(function(el, index) {
    let isModel = el instanceof DS.Model;
    let add = (isModel && !base.contains(el)) || 
              !!(!isModel && base.filterBy('id', el.get('id')).length == 0);
    if (add) { base.insertAt(index, el); }
  });
}

export default Ember.Component.extend(RefreshViewMixin, {
  tagName: 'li',
  expanded: false,
  loading: false,
  classNameBindings: ['isTrash'],
  refreshTasks: ['refreshSubDirs'],
  refreshSubDirs: function() {
    if (this.get('expanded')) {
      var current = this.get('subdirs');
      if (!current.content == null) { return }
      var res = this.get('resolver')(this.get('root'));
      res.then(function(){
        mergeArrayContents(current, res);
      });
    }
  },
  
  name: function(){
    var root = this.get('root');
    var res = root.split('/').pop();
    if (root == '/') { res = 'My folders';}
    if (root == 'shared') { res = 'Shared with me';}
    return res;
  }.property('root'),

  notLink: function(){
    /*  Do not show link if 
        - It is a user sharing objects
        - It is the root of the shared with me objects
        - It is the parent of containers ('/')
    */
    var b = this.get('root') === '/';
    var c = this.get('root') === 'shared';
    return this.get('is_user') || b || c;
  }.property('root', 'is_user'),

  is_container: function(){
    return (this.get('root').match(/\//g) || [] ).length == 1 ;
  }.property('root'),

  is_user: function(){
    return this.get('root').indexOf('\/accounts\/') == 0 && 
            this.get('root').replace('\/accounts\/', '').indexOf('/') === -1;
  }.property('root'),

  is_folder: function(){
    return !this.get('is_container') && !this.get('is_root');
  }.property('is_root', 'is_container'),

  isTrash: function(){
    return this.get('root').split('/')[1] === 'trash' && this.get('is_container');  
  }.property('root', 'is_container'),

  iconCls: function(){
    var res = "fa-folder";
    if (this.get('expanded')) { res = "fa-folder-open";}
    if (this.get('isTrash')) { res = "fa-trash";}
    if (this.get('is_user')) { res = "fa-user";}
    if (this.get('root') === 'shared') { res = "fa-share-alt"}
    return res;
  }.property('isTrash', 'expanded', 'is_user', 'root'),

  iconClsToggle: function(){
    var res = "fa-plus";
    if (this.get('expanded')){
      res = "fa-minus";
    }
    return res;
  }.property('expanded'),

  container_id: function(){
    var parts = this.get('root').split('/');
    var account = parts.shift();
    var container_name = parts.shift();
    return account + '/' + container_name;
  }.property('root'),

  current_path: function(){
    var arr = this.get('root').split('/');
    arr.shift();
    arr.shift();
    return arr.join('/');
  }.property('root'),

  subdirs: function(){
    var self = this;
    if (!this.get('expanded')){
      return [];
    }
    var res = this.get('resolver')(this.get('root'));
    res.then(function(b){
      self.set('loading', false);
    });
    return res;
  }.property('root', 'expanded'),

  href: function(){
    var href, parts;
    switch (this.get('role') ) {
      case 'shared':
        parts = this.get('root').split('/');
        parts.splice(3,1);
        href = 'shared'+ parts.join('/');
        break;
      case 'nav':
      case 'select':
        parts = this.get('root').split('/');
        parts.shift();
        href = 'containers/'+parts.join('/');
        break;
    }

    let path = href.split('/');
    var escaped = encodeURIComponent(path.join('/')).replace(/\%2f/gi, '/');
    return escaped;
  }.property('root', 'role'),

  actions: {

    toggle: function(){
      if (!(this.get('expanded'))) {
        this.set('loading', true);
      }
      this.toggleProperty('expanded');
    },

    select: function(root){
      var param = root || this.get('root');
      this.sendAction('action', param);
    }

  }

});
