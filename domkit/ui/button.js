define(
    ['jquery', 'domkit/domkit', 'domkit/util/handlercollection',
     'domkit/util/touchclickcanceller'],
    function ($, Domkit, HandlerCollection, TouchClickCanceller) {

  var _DATA_FIELD_KEY = '_data_dk_button_object';


  // Button extends the HTML button element, giving default behaviors.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  var Button = function (jQueryOrDomID) {
    HandlerCollection.call(this);

    this._$element = Domkit.validateOrRetrieveJQueryObject(jQueryOrDomID);
    this._canceller = TouchClickCanceller.create(this._$element);
    this._disabled = false;
    this._isFlat = this._$element.hasClass('dk-flat-button') ||
        this._$element.hasClass('dk-flat-toggleable-button');
    this._toggleable = this._$element.hasClass('dk-toggleable-button') ||
        this._$element.hasClass('dk-flat-toggleable-button');
    this._toggled = this._toggleable &&
        this._$element.hasClass('dk-active-button');
    this._interactionHandlers = Object.create(null);
    this._pointerDown = false;

    this._interactionHandlers.press = this._handlePress.bind(this);
    this._interactionHandlers.release = this._handleRelease.bind(this);
    this._interactionHandlers.leave = this._handleLeave.bind(this);

    this._$element.bind('mousedown', this._interactionHandlers.press);
    this._$element.bind('mouseup', this._interactionHandlers.release);
    this._$element.bind('mouseleave', this._interactionHandlers.leave);

    if ('ontouchstart' in document) {
      this._interactionHandlers.touchstart = this._handleTouchStart.bind(this);
      this._interactionHandlers.touchend = this._handleTouchEnd.bind(this);
      this._$element.bind('touchstart', this._interactionHandlers.touchstart);
      this._$element.bind('touchend', this._interactionHandlers.touchend);
      this._$element.bind('touchleave', this._interactionHandlers.leave);
    }

    this._$element.data(_DATA_FIELD_KEY, this);

    if (!this._isDKButton()) {
      this._$element.addClass('dk-button');
    }
  };
  Button.prototype = Object.create(HandlerCollection.prototype);
  Button.prototype.constructor = Button;


  // addClickHandler registers a function to handle click events on the button.
  //
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the button is
  //       active (toggled) or not.
  Button.prototype.addClickHandler = Button.prototype._addHandler;


  // addStateHandler is an alias for addClickHandler
  Button.prototype.addStateHandler = Button.prototype.addClickHandler;


  // click initiates the handling of a UI click on the button.
  Button.prototype.click = function () {
    this._handlePress();
    this._handleRelease();
  };


  // destroy removes all callback handlers from the element
  Button.prototype.destroy = function () {
    this._$element.unbind('mousedown', this._interactionHandlers.press);
    this._$element.unbind('mouseup', this._interactionHandlers.release);
    this._$element.unbind('mouseleave', this._interactionHandlers.leave);

    if ('ontouchstart' in document) {
      this._$element.unbind('touchstart', this._interactionHandlers.touchstart);
      this._$element.unbind('touchend', this._interactionHandlers.touchend);
      this._$element.unbind('touchleave', this._interactionHandlers.leave);
    }

    this._$element.data(_DATA_FIELD_KEY, null);
    this._destroyTouchClickCanceller();
  };


  // destroys functionallity of the button's TouchClickCanceller, preventing
  // responsive events on touch but enabling default click behavior. This
  // functionallity might be desired for download links or other elements that
  // MUST be triggered by a real click, not a fake click.
  Button.prototype.destroyTouchClickCanceller = function () {
    if (this._canceller) {
      this._canceller.destroy();
      this._canceller = null;
    }
  };


  // disable button, preventing all events from triggering and updating button
  // styling.
  Button.prototype.disable = function () {
    this._$element.addClass('dk-disabled');
    this._disabled = true;
  };


  // enable button, resuming processing all events and updating button
  // styling.
  Button.prototype.enable = function () {
    this._$element.removeClass('dk-disabled');
    this._disabled = false;
  };


  // getState returns whether the button is active or not.
  Button.prototype.getState = function () {
    return this._toggleable && this._toggled;
  };


  // _handlePress handles touchstart and mousedown
  Button.prototype._handlePress = function () {
    if (this._disabled) return;
    this._$element.addClass('dk-pressed-button');
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

    if (this._toggleable) {
      this._toggled = !this._toggled;

      if (this._toggled) this._$element.addClass('dk-active-button');
      else this._$element.removeClass('dk-active-button');
    }

    this._$element.removeClass('dk-pressed-button');

    this._pointerDown = false;
    this._callHandlers(this._toggled);
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
    }
    
    this._touchScreenCoordinate = null;
  };


  // _handleLeave mouseleave handles touchleave and mouseleave
  Button.prototype._handleLeave = function () {
    if (this._disabled) return;
    if (this._pointerDown) {
      this._$element.removeClass('dk-pressed-button');
    }
    if (this._touchScreenCoordinate) this._touchScreenCoordinate = null;
    this._pointerDown = false;
  };


  // _isDKButton verifies that the element the Button instance is bound to
  // has a dk-button or related CSS class.
  Button.prototype._isDKButton = function () {
    return this._$element.hasClass('dk-button') ||
      this._$element.hasClass('dk-flat-button') ||
      this._$element.hasClass('dk-toggleable-button') ||
      this._$element.hasClass('dk-flat-toggleable-button');
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
  Button.prototype.removeClickHandler = Button.prototype._removeHandler;


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
  Button.create = function (jQueryOrDomID) {
    var $element = Domkit.validateOrRetrieveJQueryObject(jQueryOrDomID);
    var buttonInstance = $element.data(_DATA_FIELD_KEY);
    return buttonInstance ? buttonInstance : new Button($element);
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
