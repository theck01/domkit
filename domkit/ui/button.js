define(
    ['jquery', 'domkit/domkit', 'domkit/util/handlercollection',
     'domkit/ui/base'],
    function ($, Domkit, HandlerCollection, Base) {

  var _DATA_FIELD_KEY = '_data_dk_button_object';


  // Button extends the HTML button element, giving default behaviors.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  //   opt_createClickCancel: optional, prevents active click cancelling on
  //       touch events.
  var Button = function (jQueryOrDomID, opt_preventClickCancel) {
    Base.call(this, jQueryOrDomID, opt_preventClickCancel);
    var $element = this.getElement();

    this._disabled = false;
    this._handlerCollection = new HandlerCollection();
    this._isFlat = $element.hasClass('dk-flat-button') ||
        $element.hasClass('dk-flat-toggleable-button');
    this._toggleable = $element.hasClass('dk-toggleable-button') ||
        $element.hasClass('dk-flat-toggleable-button');
    this._toggled = this._toggleable &&
        $element.hasClass('dk-active-button');
    this._interactionHandlers = Object.create(null);
    this._pointerDown = false;

    this._interactionHandlers.press = this._handlePress.bind(this);
    this._interactionHandlers.release = this._handleRelease.bind(this);
    this._interactionHandlers.leave = this._handleLeave.bind(this);

    $element.bind('mousedown', this._interactionHandlers.press);
    $element.bind('mouseup', this._interactionHandlers.release);
    $element.bind('mouseleave', this._interactionHandlers.leave);

    if (this.cancelsTouchGeneratedClicks()) {
      this._interactionHandlers.touchstart = this._handleTouchStart.bind(this);
      this._interactionHandlers.touchend = this._handleTouchEnd.bind(this);
      $element.bind('touchstart', this._interactionHandlers.touchstart);
      $element.bind('touchend', this._interactionHandlers.touchend);
      $element.bind('touchleave', this._interactionHandlers.leave);
    }

    $element.data(_DATA_FIELD_KEY, this);

    if (!this._isDKButton()) {
      $element.addClass('dk-button');
    }
  };
  Button.prototype = Object.create(Base.prototype);
  Button.prototype.constructor = Button;


  // addClickHandler registers a function to handle click events on the button.
  //
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the button is
  //       active (toggled) or not.
  Button.prototype.addClickHandler = function (handler) {
    this._handlerCollection.addHandler(handler);
  };


  // addStateHandler is an alias for addClickHandler
  Button.prototype.addStateHandler = Button.prototype.addClickHandler;


  // click initiates the handling of a UI click on the button.
  Button.prototype.click = function () {
    this._handlePress();
    this._handleRelease();
  };


  // destroy removes all callback handlers from the element
  Button.prototype.destroy = function () {
    var $element = this.getElement();

    $element.unbind('mousedown', this._interactionHandlers.press);
    $element.unbind('mouseup', this._interactionHandlers.release);
    $element.unbind('mouseleave', this._interactionHandlers.leave);

    if ('ontouchstart' in document) {
      $element.unbind('touchstart', this._interactionHandlers.touchstart);
      $element.unbind('touchend', this._interactionHandlers.touchend);
      $element.unbind('touchleave', this._interactionHandlers.leave);
    }
    
    Base.prototype.destroy.call(this);
  };


  // disable button, preventing all events from triggering and updating button
  // styling.
  Button.prototype.disable = function () {
    var $element = this.getElement();
    $element.addClass('dk-disabled');
    this._disabled = true;
  };


  // enable button, resuming processing all events and updating button
  // styling.
  Button.prototype.enable = function () {
    var $element = this.getElement();
    $element.removeClass('dk-disabled');
    this._disabled = false;
  };


  // getState returns whether the button is active or not.
  Button.prototype.getState = function () {
    return this._toggleable && this._toggled;
  };


  // _handlePress handles touchstart and mousedown
  Button.prototype._handlePress = function () {
    if (this._disabled) return;
    var $element = this.getElement();
    $element.addClass('dk-pressed-button');
    this._pointerDown = true;
  };


  // _handleTouchStart stores touch location and defers to _handlePress
  Button.prototype._handleTouchStart = function (e) {
    this._touchScreenCoordinate = {
      x: e.originalEvent.touches[0].clientX,
      y: e.originalEvent.touches[0].clientY
    };
    this._handlePress();
  };


  // _handleRelease handles touchend and mouseup
  Button.prototype._handleRelease = function () {
    if (this._disabled) return;

    var $element = this.getElement();

    if (this._toggleable) {
      this._toggled = !this._toggled;
      if (this._toggled) $element.addClass('dk-active-button');
      else $element.removeClass('dk-active-button');
    }

    $element.removeClass('dk-pressed-button');

    this._pointerDown = false;
    this._handlerCollection.callHandlers(this._toggled);
  };


  // _handleTouchEnd delegates to _handleRelease if touchend is in equivalent
  // location to touchstart.
  Button.prototype._handleTouchEnd = function (e) {
    touchEndScreenCoordinate = {
      x: e.originalEvent.changedTouches[0].clientX,
      y: e.originalEvent.changedTouches[0].clientY
    };

    // Only handle release if the touch ended near where it started.
    if (TouchClickCanceller.compareLocations(
        this._touchScreenCoordinate, touchEndScreenCoordinate)) {
      this._handleRelease();
    } else this._handleLeave();
    this._touchScreenCoordinate = null;
  };


  // _handleLeave mouseleave handles touchleave and mouseleave
  Button.prototype._handleLeave = function () {
    if (this._disabled) return;
    if (this._pointerDown) {
      var $element = this.getElement();
      $element.removeClass('dk-pressed-button');
    }
    this._pointerDown = false;
  };


  // _isDKButton verifies that the element the Button instance is bound to
  // has a dk-button or related CSS class.
  Button.prototype._isDKButton = function () {
    var $element = this.getElement();
    return $element.hasClass('dk-button') ||
      $element.hasClass('dk-flat-button') ||
      $element.hasClass('dk-toggleable-button') ||
      $element.hasClass('dk-flat-toggleable-button');
  };


  // isToggleable returns whether the button is a toggleable button or a
  // standard button.
  Button.prototype.isToggleable = function () {
    return this._toggleable;
  };


  // removeClickHandler unregisters a function that handles click events on the
  // button.
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the button is
  //       active (toggled) or not.
  Button.prototype.removeClickHandler = function (handler) {
    this._handlerCollection.removeHandler(handler);
  };


  // removeStateHandler is an alias for removeClickHandler
  Button.prototype.removeStateHandler = Button.prototype.removeClickHandler;


  // setState updates the button's toggle state to the desired boolean.
  // Arguments:
  //     toggled: Boolean, whether the button will be toggled or not.
  Button.prototype.setState = function (toggled) {
    if (this._toggleable && this._toggled != toggled) this.click();
  };


  // create returns a Button instance for the given domID. If the instance
  // already exists then the instance is returned, if not then a new instance
  // is returned.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  //   opt_createClickCancel: optional, prevents active click cancelling on
  //       touch events.
  Button.create = function (jQueryOrDomID, opt_preventClickCancel) {
    return Base.create(Button, jQueryOrDomID, opt_preventClickCancel);
  };


  // createAll initializes all buttons in the document as domkit buttons.
  Button.createAll = function () {
    $('.dk-button').each(function () {
      Button.create($(this));
    });
    $('.dk-flat-button').each(function () {
      Button.create($(this));
    });
    $('.dk-toggleable-button').each(function () {
      Button.create($(this));
    });
    $('.dk-flat-toggleable-button').each(function () {
      Button.create($(this));
    });
  };

  
  return Button;
});
