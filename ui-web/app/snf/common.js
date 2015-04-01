/**
* {{bytesToHuman}}
*
* Converts bytes into a nice representation with unit.
* e.g. 13661855 => 13.7 MB, 825399 => 825 KB, 1396 => 1 KB
* @param  {[type]} value
* @return {[type]}
*/

export function bytesToHuman(bytes){
  var sizes = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === null) {
    return '--';
  }
  if (bytes === 0) { 
    return '0';
  }
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}


//Set an object highlight to true for a given time only
export function tempSetProperty(object, prop){
  object.set(prop, true);
  Ember.run.later((function() {
    object.set(prop, false);
  }), 10000);

}


export function timeHuman(value, short=false) {
  if (short) {
    return moment(value).format("DD-MM-YYYY");
  } 
  return moment(value).format("DD-MM-YYYY HH:mm");
}

export function timestampHuman(value, short=false) {
  if (short) {
    return moment.unix(value).format("DD-MM-YYYY");
  } 
  return moment.unix(value).format("DD-MM-YYYY HH:mm");
}


