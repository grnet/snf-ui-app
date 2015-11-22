import Ember from 'ember';
import ControllerNameMixin from '../../../mixins/name';
import { module, test } from 'qunit';

module('NameMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var ControllerNameObject = Ember.Object.extend(ControllerNameMixin);
  var subject = ControllerNameObject.create();
  assert.ok(subject);
});
