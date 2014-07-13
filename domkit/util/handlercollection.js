define([], function () {
  // HandlerCollection instances can register event handlers, remove event
  // handlers, and trigger all handlers with optional arguments.
  var HandlerCollection = function () {
    this._handlers = [];
  };


  // _addHandler to the collection.
  //
  // Argument:
  //   handler: A function that takes an arbitrary set of arguments.
  HandlerCollection.prototype._addHandler = function (handler) {
    for (var i = 0; i < this._handlers.length; i++) {
      if (this._handlers[i] === handler) return; 
    }

    this._handlers.push(handler);
  };


  // _callHandlers calls all handlers with an optional arbitrary set of
  // arguments
  // 
  // Arguments:
  //   Any set of arguments that the handler functions expect to recieve.
  HandlerCollection.prototype._callHandlers = function () {
    var args = Array.prototype.slice.call(arguments);
    for (var i = 0; i < this._handlers.length; i++) {
      this._handlers[i].apply(null, args);
    }
  };


  // _removeHandler from the collection.
  //
  // Arguments:
  //   handler: The function to remove from the set of handlers.
  HandlerCollection.prototype._removeHandler = function (handler) {
    for (var i = this._handlers.length - 1; i >= 0; i--) {
      if (this._handlers[i] === handler) {
        this._handlers.splice(i, 1);
      }
    }
  };


  return HandlerCollection;
});
