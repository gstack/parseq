/**
 * A simpler alternative to Step
 * @copyright    (c) 2012 Sutoiku, Inc. All rights reserved.
 * @author       psq@sutoiku.com (Pascal Belloncle)
 * @module       parseq
 */

(function (factory) {
 if (typeof exports === 'object') {
   module.exports = factory(require('debug'), require('setimmediate'));
 } else if (typeof define === 'function' && define.amd) {
   define(['debug', 'setimmediate'], factory);
 }
}) (function(debu, setImmediate) {

var debug = debu('parseq');

function chunk(array, chunkSize) {
  return [].concat.apply([],
    array.map(function(elem,i) {
        return i%chunkSize ? [] : [array.slice(i,i+chunkSize)];
    })
  );
}

function par() {
  var seqArgs = arguments;
  var max = seqArgs.length-1;
  var slot = 0;
  var results = [];
  var groups = [];
  var error = null;
  debug("new max1", max);
  for (var i = 0; i < seqArgs.length-1; i++) {
    var done = (function newSlot(value) {
      debug("newSlot", value);
      var done1 = function(err, result) {
        if (arguments.length === 0) {
          // return a new callback
          if (groups[value]) {
            max++;
            debug("new max2", max);
            return newSlot(slot++);
          } else {
            debug("new max4", max);
            groups[value] = true;
            return done1;
          }
        } else {
          // record completion
          debug("complete", value, result);
          results[value] = result;
          if (err) {
            error = err;
          }
          max--;
          debug("new max3", max);
          if (max === 0) {
            seqArgs[seqArgs.length-1](error, results);
          }
        }
      };
      return done1;
    })(slot++);
    var result = seqArgs[i].apply(done, []);
    if (typeof result !== "undefined") {
      done(null, result);
    }
  }
}


function seq() {
  var i = 0;
  var seqArgs = arguments;
  var max = seqArgs.length-1;
  var fn = seqArgs[i];
  var args = [null];
  var next = function(err, value) {
    debug("seq.next", err, value);
    args[0] = err;
    args[1] = value;
    var fn = seqArgs[++i];
    if (!err && (i < max)) {
      debug("seq.apply2", i, max);
      var result = fn.apply(next, args);
      if (typeof result !== "undefined") {
        debug("seq.result", i, result);
        return next(null, result);
      }
    } else {
      // call last function
      debug("seq.apply3", i, max);
      seqArgs[max].apply(next, args);
    }
  };

  debug("seq.apply1", i, max);
  var result = fn.apply(next, args);
  if (typeof result !== "undefined") {
    debug("seq.result", i, result);
    next(null, result);
  }
}

function each(arr, cb, done) {
  if(!arr || arr.length === 0) {return done();}
  var max = arr.length;
  var current = 0;
  var results = [];
  var error = null;
  function next() {
    if (current < max) {
      cb(arr[current++], function(err, result) {
        if (err && !error) {
          error = err;
        }
        results.push(result);
        if ((current & 31) === 0) {  // Hugues suggested using %42, but 32 is faster (no division :), still arbitrary. )
          setImmediate(next);
        } else {
          next();
        }
      });
    } else {
      done(error, results);
    }
  }
  next();
}

function pareach(arr, bucket, cb, done) {
  if(!arr || arr.length === 0) {return done ? done() : cb();}
  if(typeof bucket === 'function') {
    done = cb;
    cb = bucket;

    var max = arr.length;
    var results = [];
    var error = null;
    var count = 0;
    for (var i = 0; i < max; i++) {
      (function(i) {
        cb(arr[i], function(err, result) {
          if (err) {
            if (!error) {
              error = err;
            }
          } else {
            results[i] = result;
          }
          count++;
          if (count >= max) {
            done(error, results);
          }
        });
      })(i);
    }

  } else {
    var parts = chunk(arr, bucket);
    each(parts, function(part, done) {
      pareach(part, cb, done);
    }, function(err, resArray) {
      var res = [];
      var resPart;
      for(var i=0, l=resArray.length; i<l; i++) {
        resPart = resArray[i];
        for(var j=0, ll=resPart.length; j<ll; j++) {
          res[i*bucket+j] = resPart[j];
        }
      }
      done(err, res);
    });
  }
}

seq.each = each;
par.each = pareach;

function ParSeq() {
  this.par = par;
  this.seq = seq;
  this.each = each;
}

ParSeq.par = par;
ParSeq.seq = seq;
ParSeq.each = each;

return ParSeq;

});
