var profiler = require('another-v8-profiler');
var cpu = profiler.cpuProfiler;
console.log("CPU", cpu);

cpu.startProfiling();
var fs = require('fs');
var count = function(count, char) {
  if (!char) { return count }
  for (ch in count) {
    if (char == ch) {
      count[ch] += 1;
    }
  }
  return count;
}

var arr = [];
fs.readFile(process.argv[1], function(err, data) {
  var chars = data.toString('utf8').split("").reduce(count, {a:0, b:0, c:0});
  console.log("CHARS", chars);
  cpu.stopProfiling();
});
