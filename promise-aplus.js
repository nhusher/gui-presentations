
function SimplePromise(resolverFunction) {
    var callbacks  = [],
        errorbacks = [],
        result     = null,
        status     = 'pending';

    function fulfill(value) {
        if(status === 'pending') {
            result = value;
        }
        
        if(status !== 'rejected') {
            
        }
    }
    
    function reject(reason) {
        
    }

    this.then = function(callback, errorBack) {
        
    }
}