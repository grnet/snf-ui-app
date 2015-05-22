import DS from 'ember-data';
import {timeHuman} from '../snf/common';

export default DS.Model.extend({
  name: DS.attr('string'),
  project: DS.belongsTo('project', {async:true}),
  objects: DS.hasMany('object', {async:true}),
  bytes: DS.attr('number', {defaultValue: 0}),
  count: DS.attr('number', {defaultValue: 0}),
  path: DS.attr('string'),
  last_modified: DS.attr('date'),

  last_modified_human: function(){
    return timeHuman(this.get('last_modified'));
  }.property('last_modified'),

  isTrash: function(){
    return this.get('name').toLowerCase() == 'trash';
  }.property('name'),

  order: function(){
    return this.get('isTrash')? 1: 0;
  }.property('isTrash'),

});
