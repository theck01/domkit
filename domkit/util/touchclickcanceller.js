define(['domkit/util/expirationqueue'], function (ExpirationQueue) {
  // Time to maintain reference to touch location after touch event, allowing
  // location to be used to cancel click events, in milliseconds.
  _CLICK_DELAY_TIME = 1000;
  // Difference in x and y pixel position where to locations can still be
  // considered equal.
  _LOCATION_DIFF = 20;


  // Make the expiration queue global, ensuring that a touch on one element
  // will not cause a click on another element.
  var globalExpirationQueue = new ExpirationQueue(_CLICK_DELAY_TIME);

  // _TouchClickCanceller prevents 'click' events from propagating after touch
  // events.
  // Arguments:
  //     $element: jQuery object to prevent delayed click events on.
  var _TouchClickCanceller = function ($element) {
    this._$element = $element;

    this._handlers = {};
    this._handlers.touch = this._touchStartHandler.bind(this);
    this._handlers.click = this._clickHandler.bind(this);

    this._$element.on('touchstart', this._handlers.touch);
    this._$element.on('click', this._handlers.click);
    this._$element.on('mousedown', this._handlers.click);
    this._$element.on('mouseup', this._handlers.click);
  };


  // _touchStartHandler queues the touch location to the expiration queue to
  // prevent processing click events in that area due to the touch.
  _TouchClickCanceller.prototype._touchStartHandler = function (e) {
    for (var i = 0; i < e.originalEvent.touches.length; i++) {
      var loc = {
        x: e.originalEvent.touches[i].clientX,
        y: e.originalEvent.touches[i].clientY
      };

      globalExpirationQueue.add(loc);
    }
  };


  // _clickHandler stops event propagation and prevents the default if the
  // event location corresponds to a recent touch.
  // Extra arguments:
  //     opt_allowClick: optional, whether to prevent the click from being
  //         blocked.
  _TouchClickCanceller.prototype._clickHandler = function (e, opt_allowClick) {
    var loc = { x: e.clientX, y: e.clientY };

    // Only add the touch location if it does not already exist in the queue.
    if (!opt_allowClick && globalExpirationQueue.hasElement(
        loc, TouchClickCanceller.compareLocations)) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
    }
  };


  // destory removes event handlers from the element.
  _TouchClickCanceller.prototype.destroy = function () {
    this._$element.off('touchstart', this._handlers.touch);
    this._$element.off('click', this._handlers.click);
    this._$element.off('mousedown', this._handlers.click);
    this._$element.off('mouseup', this._handlers.click);
  };


  // Eternal class with static constructor that creates _TouchClickCancellers
  // only if touch events are enabled on the device.
  var TouchClickCanceller = Object.create(null);


  // Compare locations to determine if they are equivalent, with an error
  // margin to handle stubtle shifts in position due to finger movements.
  TouchClickCanceller.compareLocations = function (a, b) {
    return Math.abs(a.x - b.x) < _LOCATION_DIFF &&
        Math.abs(a.y - b.y) < _LOCATION_DIFF;
  };

  
  // create returns an instance of the canceller if touch events are enabled,
  // or null if not.
  // Arguments:
  //     $element: jQuery object to prevent delayed click events on.
  TouchClickCanceller.create = function ($element) {
    if ('ontouchstart' in window) return new _TouchClickCanceller($element);
    return null;
  };


  // forceClick on element bypasses click prevention due to touch events with a
  // simulated click.
  TouchClickCanceller.forceClick = function ($element) {
    $element.trigger('click', [true]);
  };


  return TouchClickCanceller;
});
