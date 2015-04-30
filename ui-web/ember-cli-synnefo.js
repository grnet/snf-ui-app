module.exports = {
  contentFor: function(type, config) {
    var django = config.djangoContext;
    if (type === 'settings') {
      if (django) {
        return 'window.SETTINGS = {{ app_settings|safe }}';
      } else {
        return 'window.SETTINGS = ' + JSON.stringify(config.appSettings || {}) + ';';
      }
    }

    if (type === 'mediaURL') {
      if (django) {
        return '{{ MEDIA_URL }}';
      } else {
        return '/';
      }
    }
  }
};
