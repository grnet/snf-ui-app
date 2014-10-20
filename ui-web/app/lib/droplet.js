(function($window, $ember, $jQuery) {

    "use strict";

    /**
     * @module App
     * @class EmberDropletController
     * @type Ember.Mixin
     * @extends Ember.Mixin
     */
    $window.SnfDropletController = $ember.Mixin.create(DropletController,{

        actions: {
            /**
             * Uploads all of the files that haven't been uploaded yet, but are valid files.
             *
             * @method uploadAllFiles
             * @return {Object|Boolean} jQuery promise, or false if there are no files to upload.
             */
            uploadAllFiles: function() {

                /**
                 * @property defaultOptions
                 * @type {Object}
                 */
                var defaultOptions = {
                    fileSizeHeader: true,
                    useArray: true
                };

                if ($ember.get(this, 'validFiles').length === 0) {
                    // Determine if there are even files to upload.
                    return false;
                }

                // Find the URL, set the uploading status, and create our promise.
                var url             = $ember.get(this, 'dropletUrl'),
                    options         = $ember.get(this, 'dropletOptions') || defaultOptions,
                    postData        = this.get('postData'),
                    requestHeaders  = $ember.get(this, 'dropletHeaders');

                $ember.set(this, 'uploadStatus.uploading', true);
                $ember.set(this, 'uploadStatus.error', false);

                // Assert that we have the URL specified in the controller that implements the mixin.
                $ember.assert('You must specify the `dropletUrl` parameter in order to upload files.', !!url);

                // Create a new form data instance.
                var formData = new $window.FormData();

                // Node.js is clever enough to deduce an array of images, whereas Ruby/PHP require the
                // specifying of an array-like name.
                var fieldName = options.useArray ? 'file[]' : 'file';

                // Add any extra POST data specified in the controller
                for (var index in postData) {
                    if (postData.hasOwnProperty(index)) {
                        formData.append(index, postData[index]);
                    }
                }

                var headers = {};

                if (options.fileSizeHeader) {

                    // Set the request size, and then we can upload the files!
                    headers['X-File-Size'] = this._getSize();

                }

                // Assign any request headers specified in the controller.
                for (index in requestHeaders) {
                    if ((requestHeaders.hasOwnProperty(index)) || (index in requestHeaders)) {
                        headers[index] = requestHeaders[index];
                    }
                }

                // Iterate over each file, and append it to the form data.
                $ember.EnumerableUtils.forEach($ember.get(this, 'validFiles'), function(file) {
                    formData.append(fieldName, file.file);
                }); 
 
                var jqXhrs = [];
                // Iterate over each file, and append it to the form data.
                $ember.EnumerableUtils.forEach($ember.get(this, 'validFiles'), function(file) {
                    var formData = new $window.FormData();
                    formData.append('X-Object-Data', file.file);
                
                    var ajaxUrl = url + file.file.name;
                    var contentType = file.file.type;

                    var jqXhr = $jQuery.ajax({
                        url: ajaxUrl,
                        method: 'post',
                        data: formData,
                        headers: headers,
                        processData: false,
                        contentType: false,
                        dataType: 'text',

                        xhr: function() {
                            var xhr = $jQuery.ajaxSettings.xhr();
                            // Add all of the event listeners.
                            this._addProgressListener(xhr.upload);
                            this._addSuccessListener(xhr.upload);
                            this._addErrorListener(xhr.upload);
                            $ember.set(this, 'lastRequest', xhr);
                            return xhr;
                        }.bind(this)
                    });
                    jqXhrs.push(jqXhr);
                }, this);


                //$ember.set(this, 'lastJqXhr', jqXhr);

                // Return the promise.
                return Ember.RSVP.all(jqXhrs).then($ember.run.bind(this, function(response) {
                    // Invoke the `didUploadFiles` callback if it exists.
                    $ember.tryInvoke(this, 'didUploadFiles', [response]);

                    return response;
                })).catch(function(reason){
                    console.log(reason, 'reason');
                });
            }

        },
    });

})(window, window.Ember, window.jQuery);

export default SnfDropletController;
