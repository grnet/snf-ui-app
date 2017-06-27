/* jshint node: true */

module.exports = function(environment) {
  var subEnvironment;
  environment = environment || '';
  
  if (environment.indexOf('-') > -1) {
    subEnvironment = environment.split('-')[1];
    environment = environment.split('-')[0];
  }

  var ENV = {
    djangoContext: true,
    appSettings: {},
    modulePrefix: 'snf-ui',
    environment: environment,
    subEnvironment: subEnvironment,
    baseURL: '__BASE_URL__', // this will be replaced to {{ UI_BASE_URL }}
    locationType: 'auto',
    contentSecurityPolicy: {
      'style-src': "'self' 'unsafe-inline' fonts.gstatic.com *.googleapis.com",
      'font-src': "'self' fonts.gstatic.com",
      'img-src': "'self' *.kym-cdn.com data:",
      'script-src': "'self' 'unsafe-eval' 'unsafe-inline'"
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      defaultLocale: 'en',
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    ENV.APP.LOG_TRANSITIONS = true;
    ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.APP.emberDevTools = {global: true};
  }

  if (subEnvironment === 'nw') {
    ENV.djangoContext = false;
    ENV.baseURL = '/';
    ENV.locationType = 'hash';
    ENV.assetsPrefix = './';

    ENV.appSettings = {
      localToken: true,
      auth_url: 'https://accounts.okeanos.grnet.gr/identity/v2.0'
    };
  }

  if (subEnvironment === 'demo') {
    ENV.baseURL = '/newui',
    ENV.appSettings = {
      token: 'cookie:_pithos2_a',
      auth_url: '/_astakos/identity',
      proxy: {
        'astakosAccount': '/_astakos/account'
      },
      'branding': {
        STORAGE_LOGO_URL: 'https://storage.demo.synnefo.org/static/branding/images/storage_logo.png'
      }
    },
    ENV.djangoContext = false;
    ENV.assetsPrefix = '';
  }


  if (environment === 'test') {
    // Testem prefers this...
    ENV.djangoContext = false;
    ENV.appSettings = {
      token: 'TEST-TOKEN',
      auth_url: '/api/identity'
    };
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  if (environment === 'okeanos') {
    ENV.djangoContext = false;
    ENV.baseURL = '/ui/';
    ENV.appSettings = {
      token: process.env.SNF_UI_TOKEN,
      localToken: true,
      auth_url: 'https://pithos.okeanos.grnet.gr/ui/_astakos/identity',
      'branding': {
        STORAGE_LOGO_URL: 'https://pithos.okeanos.grnet.gr/static/custom-branding/storage_logo.png'
      }
    },
    ENV.djangoContext = false;
    ENV.assetsPrefix = '';
    ENV.contentSecurityPolicy = {
      'style-src': "* 'unsafe-inline'",
      'font-src': "'self' data: fonts.gstatic.com",
      'img-src': "* data:",
      'script-src': "* 'unsafe-inline'",
      'connect-src': "*"
    }
  }

  return ENV;
};
