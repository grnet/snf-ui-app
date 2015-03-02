importScripts('asmcrypto.js');

onmessage = function(e) {
  console.log('Message received from main script');
  var buffer = e.data[0], hasher = e.data[1], id = e.data[2];
  console.log('Posting message back to main script');
  var result = asmCrypto[hasher.toUpperCase()].hex(buffer);
  postMessage([result, id]);
}
