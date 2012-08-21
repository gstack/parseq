require("./parseq")();

Par(function() {
  a = this();
  b = this();
  console.log("a");
  a(null, 11);
  console.log("b");
  b(null, 12);
},
function() {
  console.log("c");
  this(null, 2);
},
function() {
  console.log("d");
  return 3;
},
function done(err, results) {
  console.log("done.results.length", results.length);
  console.log("done.results[0]", results[0]);
  console.log("done.results[1]", results[1]);
  console.log("done.results[2]", results[2]);
  console.log("done.results[3]", results[3]);
}
);

Par(
  function condpar() {
    var done = this();
    for (var i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        this()(null, i);
      }
    }
    done(null, "done");
  },
  function done(err, results) {
    console.log("condpar done", results);
  }
);

Seq(function() {
  console.log("step1");
  this(null, "from step 1");
}, function(err, value) {
  console.log("step2:", value);
  this(null, "from step 2");
}, function(err, value) {
  console.log("step3:", value);
  return "from step 3";
}, function done(err, value) {
  if (err) {
    console.error("error:", err);
  } else {
    console.log("done:", value);
  }
});

Seq(function() {
  console.log("step1");
  this("error in 1", "from step 1");
}, function(err, value) {
  console.log("step2:", value);
  this(null, "from step 2");
}, function(err, value) {
  console.log("step3:", value);
  return "from step 3";
}, function done(err, value) {
  if (err) {
    console.error("error:", err);
  } else {
    console.log("done:", value);
  }
});
