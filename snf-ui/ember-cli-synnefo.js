module.exports = {
  contentFor: function(type, config) {
    var django = config.djangoContext;
    var prefix = config.assetsPrefix === undefined ? 'ui/' : config.assetsPrefix;
    if (type === 'settings') {
      if (django) {
        return 'window.SETTINGS = {{ app_settings|safe }}';
      } else {
        return 'window.SETTINGS = ' + JSON.stringify(config.appSettings || {}) + ';';
      }
    }

    if (type === 'mediaURL') {
      if (django) {
        return '{{ MEDIA_URL }}' + prefix;
      } else {
        return prefix;
      }
    }
  }
};
