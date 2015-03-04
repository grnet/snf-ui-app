import Ember from 'ember';


 /**
 * {{convertBytes}}
 *
 * Converts bytes into a nice representation with unit.
 * e.g. 13661855 => 13.7 MB, 825399 => 825 KB, 1396 => 1 KB
 * @param  {[type]} value
 * @return {[type]}
 */

function convertBytes(bytes) {
  var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === null) {
    return '--';
  }
  if (bytes === 0) { 
    return '0 byte';
  }
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

export {
  convertBytes
};

export default Ember.Handlebars.makeBoundHelper(convertBytes);
