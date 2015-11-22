import Ember from 'ember';
import TooltipMixin from '../../../mixins/tooltip';
import { module, test } from 'qunit';

module('TooltipMixin');

// Replace this with your real tests.
test('it works', function(assert) {
  var TooltipObject = Ember.Object.extend(TooltipMixin);
  var subject = TooltipObject.create();
  assert.ok(subject);
});
