import Ember from 'ember';

export default Ember.View.extend({
	templateName: 'object',
	tagName: 'tr',
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
		var type = this.get('controller').get('type');
		var iconCls = {};

		iconCls['dir'] = 'fa-folder';
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

		return iconCls[type];
	}.property('controller.type'),

	previewSupported: function() {
		var type = this.get('controller').get('type');
		var name = this.get('controller').get('name');
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
			self.send('toggleEdit')
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
			this.get('controller').set('resetInput', true);
		}
	}
});
