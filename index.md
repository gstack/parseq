---
layout: page
title: parseq.js
tagline: a simple javascript flow control library, as simple as possible, but no simpler.
---
# INSTALL
{% highlight bash %}
$ npm install parseq
{% endhighlight %}

# USE

Conventional require statements.
{% highlight javascript %}
var par = require("parseq").par;
var seq = require("parseq").seq;
{% endhighlight %}

Or use the shorthand (but it places `par` and `seq` in the global scope, and will make jshint unhappy).

{% highlight javascript %}
require("parseq")();
{% endhighlight %}

## Sequencial flow
Calls each function sequentially.  Either the return value is passed as the second parameter to the next function, or
use `this` to get the result of an asynchronous call

{% highlight javascript %}
seq(
  function f1() {
    fs.readfile("file1", this);
  }, function f2(err, value) {
    return "from f2";
  }, function done(err, value) {
    ...
  }
);
{% endhighlight %}

Function `f2` is called with its value parameter containing the content of file1 (or err contains the error returned by readfile)

Function done is called with `value` = "from f2"

## Parallel flow

Runs the n-1 first functions given to `par` in parallel, and will call the last function when all others have completed.

{% highlight javascript %}
par(
  function() {
    fs.readFile("file1", this);
  },
  function() {
    fs.readFile("file2", this);
  },
  function done(err, results) {
    ...
  }
);
{% endhighlight %}

In `done`, `results[0]` contains the content of file1, `results[1]` contains the content of file2. `done` is always called no matter what as the last function.  If any function signals an error, `done` will be called next and remaining functions will be skipped.

Parameter `err` contains the first encountered error if any

## Dynamic number of Parallel flow

Use `this()` as the callback instead of just `this`.

{% highlight javascript %}
par(
  function() {
    for (var i = 0; i < 5; i++) {
      fs.readFile("file" + i, this());
    }
  },
  function done(err, results) {
    ...
  }
);
{% endhighlight %}
Paramter `results[0-4]` contains the content of file[0-4].  Values are guaranteed to be in the same order as the calls to `this()`.

Parameter err contains the first encountered err if any


# TESTING
Really just a very verbose example, more tests coming up
{% highlight bash %}
$ node testparseq.js
{% endhighlight %}

# RESOURCES
* Githup [repo](https://github.com/sutoiku/parseq)
* Issue [tracker](https://github.com/sutoiku/parseq/issues)
* Contribute by creating [pull requests](https://github.com/sutoiku/parseq/pulls)!

# LICENSE
parseq.js is freely distributable under the terms of the MIT license.

Copyright (c) 2012 Sutoiku, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.