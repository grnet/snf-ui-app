importScripts('asmcrypto.js');

onmessage = function(e) {
  var buffer = e.data[0], hasher = e.data[1], id = e.data[2];
  var result = asmCrypto[hasher.toUpperCase()].hex(buffer);
  postMessage([result, id]);
}
