import Cookie from 'ui-web/snf/cookie';

export function initialize(container, app) {
  app.register('cookie:main', Cookie);
  app.inject('controller', 'cookie', 'cookie:main');
  app.inject('route', 'cookie', 'cookie:main');
}

export default {
  name: 'cookie',
  initialize: initialize
};

