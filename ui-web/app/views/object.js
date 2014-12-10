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

});