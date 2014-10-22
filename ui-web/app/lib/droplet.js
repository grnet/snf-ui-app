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
                // Assert that we have the URL specified in the controller that implements the mixin.
                $ember.assert('You must specify the `dropletUrl` parameter in order to upload files.', !!url);

                $ember.set(this, 'uploadStatus.uploading', true);
                $ember.set(this, 'uploadStatus.error', false);

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

                $ember.set(file, 'uploadStatus.uploading', true);
                $ember.set(file, 'uploadStatus.error', false);


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
                            this._addProgressListener(xhr.upload, file);
                            this._addSuccessListener(xhr.upload, file);
                            this._addErrorListener(xhr.upload, file);
                            $ember.set(this, 'lastRequest', xhr);
                            return xhr;
                        }.bind(this)
                    });
                    jqXhrs.push(jqXhr);
                }, this);


                //$ember.set(this, 'lastJqXhr', jqXhr);

                // Return the promise.
                return Ember.RSVP.all(jqXhrs).then($ember.run.bind(this, function(response) {

                    $ember.set(this, 'uploadStatus.uploading', false);
                    // Invoke the `didUploadFiles` callback if it exists.
                    $ember.tryInvoke(this, 'didUploadFiles', [response]);

                    return response;
                })).catch(function(reason){
                    console.log(reason, 'reason');
                });
            }

        },


        /**
         * @method _addSuccessListener
         * @param request
         * @private
         */
        _addSuccessListener: function(request, file) {

            // Once the files have been successfully uploaded.
            request.onload = $ember.run.bind(this, function() {
                // Set the `uploaded` parameter to true once we've successfully // uploaded the files.
                //
                //$ember.EnumerableUtils.forEach($ember.get(this, 'validFiles'), function(file) {
                  //  $ember.set(file, 'uploaded', true);
                //});
              
                $ember.set(file, 'uploaded', true);


                // We want to revert the upload status.
                $ember.set(file, 'uploadStatus.uploading', false);
            });

        },

        /**
         * @method _addErrorListener
         * @param request
         * @return {void}
         * @private
         */
        _addErrorListener: function(request, file) {

            request.onerror = $ember.run.bind(this, function() {
                // As an error occurred, we need to revert everything.
                $ember.set(file, 'uploadStatus.uploading', false);
                $ember.set(file, 'uploadStatus.error', true);
            });

        },


        /**
         * @method _addProgressListener
         * @param request
         * @return {void}
         * @private
         */
        _addProgressListener: function(request, file) {

            request.onprogress = $ember.run.bind(this, function(event) {
                if (!event.lengthComputable) {
                    // There's not much we can do if the request is not computable.
                    return;
                }

                // Calculate the percentage remaining.
                var percentageLoaded = (event.loaded / event.total) * 100;
                //$ember.set(file, 'uploadStatus.percentComplete', Math.round(43));
                $ember.set(file, 'uploadStatus.percentComplete', Math.round(percentageLoaded));
            });

        },

        /**
         * Adds a file based on whether it's valid or invalid.
         *
         * @method _addFile
         * @param file {File}
         * @param valid {Boolean}
         * @return {Object}
         * @private
         */
        _addFile: function(file, valid) {

            // Extract the file's extension which allows us to style accordingly.
            var className = 'extension-%@'.fmt(file.name.match(/\.(.+)$/i)[1]).toLowerCase();

            var uploadStatus = {uploading: false, percentComplete: 0, error: false};
            
            // Create the record with its default parameters, and then add it to the collection.
            var record = { file: file, valid: valid, uploaded: false, deleted: false, className: className, uploadStatus: uploadStatus };
            $ember.get(this, 'files').pushObject(record);

            // Voila!
            return record;

        }


    });

})(window, window.Ember, window.jQuery);

export default SnfDropletController;
