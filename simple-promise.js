console.log("A really simple promise implementation:\n\n")

var Promise = function(resolverFunction) {
    var _callback,
        _errorback,
        _pending = true;

    if(!(this instanceof Promise)) {
        // If we omit the new keyword, do the right thing and add it for us.
        return new Promise(resolverFunction);
    }
    
    function fulfill(value) {
        if(_callback && _pending) {
            _callback(value);
            _pending = false;
        }
    }
    
    function reject(reason) {
        if(_callback && _pending) {
            _errorback(reason);
            _pending = false;
        }
    }
    
    this.then = function(callback, errorback) {
        _callback = callback;
        _errorback = errorback;
    };
    
    resolverFunction.call(this, fulfill, reject);
};

Promise(function(fulfill) {

    setTimeout(function() {
        fulfill();
    }, 1000)

}).then(function() {
    
    console.log("A second has passed!");
});