import Ember from 'ember';

export default Ember.Route.extend({

  templateName: 'loading/loading',

  setupController: function(controller, model) {
    var msg = [
      'Go grab a coffee!', 
      'You look cute today!',
      'What a beautiful day :)',
      'We\'ve missed you :)',
      'Just wanted to say "Hi!"'
    ];
    controller.set('happy-msg', msg[_.random(0, msg.length - 1)]);
  }
});
