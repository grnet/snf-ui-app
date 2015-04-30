import Ember from 'ember';
import {DropFileViewMixin} from '../snf/dropfile/mixins';
import {SnfAddHandlerMixin} from '../snf/dropfile/synnefo';

export default Ember.View.extend(DropFileViewMixin, SnfAddHandlerMixin, {
	templateName: 'object',
	tagName: 'li',
  classNameBindings: ['isSelected', 'toPaste'],

  dropFileTarget: Ember.computed.alias('controller.controllers.application'),

  dropFileLocation: function(event) {
    return this.get("controller.controllers.objects.path").replace(/\/$/, "") + 
           "/" + 
           this.get("controller.stripped_name");
  },

  isSelected: function(){
    return this.get('controller').get('isSelected');
  }.property('controller.isSelected'),
  
  // delegate events to parent controller for non dir entries
  drop: function(e) {
    if (!this.get("controller.is_dir")) { return true }
    return this._super(e);
  },
  dragEnter: function(e) { 
    if (!this.get("controller.is_dir")) { return true }
    return this._super(e);
  },
  dragLeave: function(e) { 
    if (!this.get("controller.is_dir")) { return true }
    return this._super(e);
  },

  toPaste: function(){
    var pasted = this.get('controller.controllers.objects.toPasteObject');
    var el = this.get('controller').get('model');
    if (pasted) {
      return (Ember.compare(pasted.get('id'),el.get('id')) === 0);
    } else {
      return false;
    }
  }.property('controller.controllers.objects.toPasteObject'),

  click: function(e) {
    if (e.target.tagName != 'DIV') { return; }
    this.get('controller').toggleProperty('isSelected');
  },
	/*
	* type -> iconCls:
	* - dir -> fa-folder
	* - text -> fa-file-text-o
	* - compressed -> fa-file-zip-o
	* - image -> fa-file-image-o
	* - audio -> fa-file-audio-o
	* - video -> fa-file-video-o
	* - pdf -> fa-file-pdf-o
	* - word -> fa-file-word-o
	* - excel -> fa-file-excel-o
	* - powerpoint -> fa-file-powerpoint-o
	* - unknown -> fa-file-o (unknown type) 
	*/
	iconCls: function() {
		var type = this.get('controller').get('model.type');
		var iconCls = {};

		iconCls['dir'] = 'fa-folder';
		iconCls['dir-open'] = 'fa-folder-open';
		iconCls['text'] = 'fa-file-text-o';
		iconCls['compressed'] = 'fa-file-zip-o';
		iconCls['image'] = 'fa-file-image-o';
		iconCls['audio'] = 'fa-file-audio-o';
		iconCls['video'] = 'fa-file-video-o';
		iconCls['pdf'] = 'fa-file-pdf-o';
		iconCls['word'] = 'fa-file-word-o';
		iconCls['excel'] = 'fa-file-excel-o';
		iconCls['powerpoint'] = 'fa-file-powerpoint-o';
		iconCls['unknown'] = 'fa-file-o';
    
    if (type == "dir") {
      type = this.get("dragActive") ? "dir-open" : "dir";
    }

		return iconCls[type];
	}.property('controller.type', 'dragActive'),

	previewSupported: function() {
		var type = this.get('controller').get('model.type');
		var name = this.get('controller').get('model.name');
    var extensionIndex = name.lastIndexOf('.') + 1;
		var extension = name.substr(extensionIndex).toLowerCase();
		var supportedFormats;
		if(type === 'image') {
			// should check the supported format of every preview plugin
			supportedFormats = ['png', 'gif', 'jpeg', 'jpg'];
			if(supportedFormats.indexOf(extension) > -1)	{
				return true;
			}
		}
		return false;
	}.property('controller.name'),

	didInsertElement: function() {
		var self = this;
		this.$('.js-show-edit').on('click', function() {
			self.send('toggleEdit');
		});

		this._super();
	},

	actions: {
		reset: function(actions) {
			/*
			* actions is the action with params that should be triggered split by comma
			* action -> actions[0]
			* params -> actions[1]
			*/
			if(actions) {
				var actions = actions.split(',');
				this.get('controller').send(actions[0], actions[1])
			}
			else {
				this.$('input').val('');
				this.send('toggleEdit');
			}
		},
		toggleEdit: function() {
			this.$('.js-show-edit').toggleClass('hidden');
			this.$('.input-with-valid').toggleClass('hidden');
			this.$('.js-hide-edit').toggleClass('hidden');
			this.$('.js-name').toggleClass('hidden');
      this.$(".input-with-valid").find('input')[0].focus();
			this.get('controller').set('resetInput', true);
		}
	}
});
