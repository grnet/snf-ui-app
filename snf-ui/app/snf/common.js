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
  var i, NumForSize;
  if (bytes === null) {
    return '--';
  }
  if (bytes === 0) { 
    return '0';
  }

  i = parseInt(Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)));

  // If the size is in bytes return the original value
  NumForSize = (i === 0) ? bytes :  (bytes / Math.pow(1024, i)).toFixed(1);

  return NumForSize + ' ' + sizes[i];
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

// helper methods for bind and unbind shortcuts
function showUsageOnKeyUp(e) {
  var quotasKey = 85; // "u"
  if(e.keyCode == quotasKey) {
    $('.footer').find('[data-popover-trigger="usage-btn"]').trigger('click');
  }
}

function showGroupsOnKeyUp(e) {
  var groupKey = 71; // "g"
  if(e.keyCode == groupKey) {
    if ($("a#groups-link").length > 0) {
      $("a#groups-link").click();
    }
  }
}

function showNewDirOrContainerOnKeyUp(e) {
  var groupKey = 78; // "g"
  if(e.keyCode == groupKey) {
    if ($(".create-container").length > 0) {
      $(".create-container").click();
    }
    if ($("a#create-dir").length > 0) {
      $("a#create-dir").click();
    }
  }
}

export function bindKeyboardShortcuts() {
  $(document).keyup(showUsageOnKeyUp);
  $(document).keyup(showGroupsOnKeyUp);
  $(document).keyup(showNewDirOrContainerOnKeyUp);
}

export function unbindKeyboardShortcuts() {
  $(document).unbind("keyup", showUsageOnKeyUp);
  $(document).unbind("keyup", showGroupsOnKeyUp);
  $(document).unbind("keyup", showNewDirOrContainerOnKeyUp);
}


