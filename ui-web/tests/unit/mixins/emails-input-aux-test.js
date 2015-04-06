import Ember from 'ember';
import EmailsInputAuxMixin from 'ui-web/mixins/emails-input-aux';

module('EmailsInputAuxMixin');

// Replace this with your real tests.
test('it works', function() {
  var EmailsInputAuxObject = Ember.Object.extend(EmailsInputAuxMixin);
  var subject = EmailsInputAuxObject.create();
  ok(subject);
});
