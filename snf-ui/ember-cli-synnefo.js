module.exports = {

  contentFor: function(type, config) {
    var django = config.djangoContext;
    var prefix = config.assetsPrefix === undefined ? '' : config.assetsPrefix;
    if (type === 'settings') {
      if (django) {
        return 'window.SETTINGS = {{ app_settings|safe }}';
      } else {
        return 'window.SETTINGS = ' + JSON.stringify(config.appSettings || {}) + ';';
      }
    }

    if (type === 'mediaURL') {
      if (django) {
        return '{{ UI_MEDIA_URL }}' + prefix;
      } else {
        return prefix;
      }
    }

    if (type === 'title') {
      if (django) { return 'Pithos+ | {{ BRANDING_SERVICE_NAME }}'; }
      return 'Synnefo UI';
    }
  }
};
