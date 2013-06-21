(function(ns) {
    var _async,
        timers;
    
    if(ns.setImmediate) { // If we have setImmediate, use it.
        _async = setImmediate;
    } else if(typeof process !== 'undefined') { // If we're in nodejs 0.11+, use their timers module.
        timers = require('timers');
        
        if(timers && timers.setImmediate) {
            console.log("using timers.setImmediate");
            _async = timers.setImmediate;
        } else {
            console.log("using process.nextTick");
            _async = process.nextTick;
        }
    } else {
        _async = setTimeout;
    }

    function Promise (fn) {
        var callbacks = [],
            errbacks  = [],
            result    = null,
            status    = 'pending';
        
        if(!(this instanceof Promise)) {
            return new Promise(fn);
        }
        
        var self = this;
        
        function wrap(callback, errback, fn) {

            return function() {
                var args = arguments,
                    res;

                _async(function() {
                    try {
                        res = fn.apply(self, args);
                    } catch (err) {
                        return errback(err);
                    }

                    if (Promise.isPromise(res)) {
                        res.then(callback, errback);
                    } else {
                        callback(res);
                    }
                });
            }
        }
        
        function fulfill(val) {
            if(status === 'pending') {
                result = val;
            }

            if(status !== 'rejected') {
                callbacks.forEach(function(callback) { callback(result); });

                callbacks = [];
                errbacks  = [];
                status    = 'fulfilled';
            }
        }
        function reject(reason) {
            if(status === 'pending') {
                result = reason;
            }
        
            if(status !== 'fulfilled') {
                errbacks.forEach(function(errback) { errback(result); });
            
                callbacks = [];
                errbacks  = [];
                status    = 'rejected';
            }
        }
        
        this.then = function(cb, eb) {
            var thenFulfill,
                thenReject,
                then = new this.constructor(function (fulfill, reject) {
                    thenFulfill = fulfill;
                    thenReject = reject;
                });

            callbacks.push( typeof cb === 'function' ? wrap(thenFulfill, thenReject, cb) : thenFulfill );
            errbacks.push(  typeof eb === 'function' ? wrap(thenFulfill, thenReject, eb) : thenReject  );

            if(status === 'fulfilled') {
                fulfill(result);
            } else if(status === 'rejected') {
                reject(result);
            }
            
            return then;
        };
        
        this.as = function(Ctor) {
            var self = this;
            return new Ctor(function(fulfill, reject) {
                self.then(fulfill, reject)
            });
        };
        
        fn.call(this, fulfill.bind(this), reject.bind(this));
    }

    Promise.isPromise = function(p) {
        if(p && typeof p.then === 'function') { return true; }
    };

    ns.Promise = Promise;

    function ajax(url, callback) {
        var xhr = new XMLHttpRequest(),
            start = Date.now(),
            timeout;

        xhr.onload = function () {
            var e = null;
            if (xhr.status === 0) {
                e = new Error('Request aborted.');
            } else if (xhr.status >= 400) {
                e = new Error(xhr.statusText);
                e.status = xhr.status;
            }
                
            callback(e, {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText
            });
        };
    
        xhr.open('GET', url, true);
        xhr.send();
    }
    
    ns.ajax = ajax;

}(typeof process !== 'undefined' ? exports : window));
