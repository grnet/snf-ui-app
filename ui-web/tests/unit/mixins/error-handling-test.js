import Ember from 'ember';
import ErrorHandlingMixin from '../../../mixins/error-handling';
import { module, test } from 'qunit';

module('ErrorHandlingMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var ErrorHandlingObject = Ember.Object.extend(ErrorHandlingMixin);
  var subject = ErrorHandlingObject.create();
  assert.ok(subject);
});
