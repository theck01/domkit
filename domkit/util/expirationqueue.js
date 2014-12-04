define([], function () {
  // Expiration queue defines a list that dequeues elements after a delay.
  // Arguments:
  //     expirationTime: The time that an element will exist in the queue
  //         before it expires in milliseconds.
  var ExpirationQueue = function (expirationTime) {
    this._expirationTime = expirationTime;
    this._queue = [];
  };


  // Add an element to the queue
  // Arguments:
  //     element: Element to search for.
  ExpirationQueue.prototype.add = function (element) {
    this._queue.push({ element: element, timestamp: Date.now() });
  };


  // _defaultCompare compares arguments for strict equality.
  // Arguments:
  //     a: any type.
  //     b: any type.
  // Returns: Boolean, whether the arguments are equal.
  ExpirationQueue._defaultCompare = function (a, b) {
    return a === b;
  };


  // Check if an element exists in the queue
  // Arguments:
  //     element: Element to search for.
  //     opt_compareFn: Optional comparision function for elements in the
  //         queue.
  ExpirationQueue.prototype.hasElement = function (element, opt_compareFn) {
    this._processExpirations();

    var compareFn = opt_compareFn || ExpirationQueue._defaultCompare;
    for (var i = 0; i < this._queue.length; i++) {
      if (compareFn(element, this._queue[i].element)) return true;
    }
    return false;
  };


  // _processExpirations clears queue of expired elements
  ExpirationQueue.prototype._processExpirations = function () {
    var now = Date.now();
    for (var i = 0; i < this._queue.length; i++) {
      if (this._queue[i].timestamp + this._expirationTime > now) break;
      this._queue.shift();
    }
  };


  return ExpirationQueue;
});
