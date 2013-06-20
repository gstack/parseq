var parseq = require("./parseq");
var par = parseq.par;
var seq = parseq.seq;

var globI = 0;
fn = function(param, cb) {
  console.log("Before", param);
  var done = cb();
  for(var i = 0; i < 3; ++i) {
    (function(currentCallback) {
      // setTimeout(function() {
        console.log(">> In function", param, "Iteration", globI);
        currentCallback(null, [param, globI]);
        globI += 1;
      // }, Math.random() * 1000);
    })(cb());
  }
  done(null, "second");
  console.log("After", param);
}

par(
  function() {
    var done = this();
    for (var i = 0; i < 5; i++) {
      fn("file" + i, this);
    }
    done(null, "first");
  },
  function done(err, results) {
  console.log("> Done", err, results, results.length);
  }
);

var arr = [];
for (var i = 0; i < 100000; i++) arr[i] = 0;

parseq.each(arr, function(elem, cb) {
  cb();
}, function(err) {
  console.log("done");
});
