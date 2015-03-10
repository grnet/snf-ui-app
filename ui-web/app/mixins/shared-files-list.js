import Ember from 'ember';

export default Ember.Mixin.create({
  
  account: null,
  path: null,
  rootPath: null,

  objectRoute: 'account.container.objects',
  rootRoute: 'account.container',

  canBack: function() {
    return Ember.typeOf(this.get("path")) === "string";
  }.property(),
  rootLevel: Ember.computed.not("canBack"),

  routeToRoot: function() {
    this.transitionToRoute(this.get("rootRoute"),
                           this.get("account").get("email"));
  },

  routeToPath: function(rootPath, path) {
    this.transitionToRoute(this.get("objectRoute"),
                           this.get("account").get("email"),
                           rootPath, path);
  },

  actions: {
    back: function(path) {
      var newPath, rootPath, split;
      if (path === "") {
        this.routeToRoot();
      } else {
        rootPath = this.get("rootPath");
        split = path.split("/");
        newPath = split.slice(0, split.length-1).join("/");
        this.routeToPath(this.get("rootPath"), newPath);
      }
    },

    enter: function(object) {
      var root, newPath;
      if (this.get("rootLevel")) {
        // containers level
        this.routeToPath(object.get("name"), '');
      } else {
        // dir level
        root = this.get("rootPath");
        newPath = this.get("path") + object.get("name");
        this.routeToPath(root, newPath);
      }
    }
  }
});
