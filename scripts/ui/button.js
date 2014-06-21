define(['jquery'], function ($) {

  var _DATA_FIELD_KEY = '_data_dk_button_object';


  // Button extends the HTML button element, giving default behaviors.
  // Arguments:
  //   domID: A CSS style id selector.
  var Button = function (domID) {
    this._$element = $(domID);
    this._toggleable = this._$element.hasClass('dk-toggleable-button') ||
        this._$element.hasClass('dk-toggleable-button-active');
    this._toggled = this._toggleable &&
        this._$element.hasClass('dk-toggleable-button-active');
    this._handlers = Object.create(null);
    this._mouseDown = false;
    this._onClickHandlers = [];

    this._handlers.mousePress = this._handlePress.bind(this);
    this._handlers.mouseRelease = this._handleRelease.bind(this);
    this._handlers.mouseLeave = this._handleLeave.bind(this);

    this._$element.bind('mousedown', this._handlers.mousePress);
    this._$element.bind('mouseup', this._handlers.mouseRelease);
    this._$element.bind('mouseleave', this._handlers.mouseLeave);

    this._$element.data(_DATA_FIELD_KEY, this);

    if (!this._isDKButton()) {
      this._$element.addClass('dk-button');
    }
  };


  // addClickHandler registers a function to handle click events on the button.
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the button is
  //       active (toggled) or not.
  Button.prototype.addClickHandler = function (handler) {
    if (this._onClickHandlers.indexOf(handler) === -1) {
      this._onClickHandlers.push(handler);
    }
  };


  // click initiates the handling of a UI click on the button.
  Button.prototype.click = function () {
    this._handlePress();
    this._handleRelease();
  };


  // destroy removes all callback handlers from the element
  Button.prototype.destroy = function () {
    this._$element.unbind('mousedown', this._handlers.mousePress);
    this._$element.unbind('mouseup', this._handlers.mouseRelease);
    this._$element.unbind('mouseleave', this._handlers.mouseLeave);

    this._$element.data(_DATA_FIELD_KEY, null);
  };


  // mousedown handler
  Button.prototype._handlePress = function () {
    if (this._toggleable) {
      if (this._toggled) {
        this._$element.addClass('dk-toggleable-button-active-pressed');
        this._$element.removeClass('dk-toggleable-button-active');
      } else {
        this._$element.addClass('dk-toggleable-button-pressed');
        this._$element.removeClass('dk-toggleable-button');
      }
    } else {
      this._$element.addClass('dk-button-pressed');
      this._$element.removeClass('dk-button');
    }

    this._mouseDown = true;
  };


  // mouseup handler
  Button.prototype._handleRelease = function () {
    if (this._toggleable) {
      this._toggled = !this._toggled;

      if (this._toggled) {
        this._$element.addClass('dk-toggleable-button-active');
        this._$element.removeClass('dk-toggleable-button-pressed');
      } else {
        this._$element.addClass('dk-toggleable-button');
        this._$element.removeClass('dk-toggleable-button-active-pressed');
      }
    } else {
      this._$element.addClass('dk-button');
      this._$element.removeClass('dk-button-pressed');
    }

    this._mouseDown = false;

    for (var i = 0; i < this._onClickHandlers.length; i++) {
      this._onClickHandlers[i](this._toggled);
    }
  };


  // mouseleave handler
  Button.prototype._handleLeave = function () {
    if (this._mouseDown) {
      if (this._toggleable) {
        if (this._toggled) {
          this._$element.addClass('dk-toggleable-button-active');
          this._$element.removeClass('dk-toggleable-button-active-pressed');
        } else {
          this._$element.addClass('dk-toggleable-button');
          this._$element.removeClass('dk-toggleable-button-pressed');
        }
      } else {
        this._$element.addClass('dk-button');
        this._$element.removeClass('dk-button-pressed');
      }
    }

    this._mouseDown = false;
  };


  // _isDKButton verifies that the element the Button instance is bound to
  // has a dk-button or related CSS class.
  Button.prototype._isDKButton = function () {
    return this._$element.hasClass('dk-button') ||
      this._$element.hasClass('dk-toggleable-button') ||
      this._$element.hasClass('dk-toggleable-button-active');
  };


  // removeClickHandler unregisters a function that handles click events on the
  // button.
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the button is
  //       active (toggled) or not.
  Button.prototype.removeClickHandler = function (handler) {
    var handlerIndex = this._onClickHandlers.indexOf(handler);
    if (handlerIndex === -1) return;
    this._onClickHandlers.splice(handlerIndex, 1);
  };


  // setToggleState updates the button's toggle state to the desired boolean.
  // Arguments:
  //     toggled: Boolean, whether the button will be toggled or not.
  Button.prototype.setToggleState = function (toggled) {
    if (this._toggleable && this._toggled != toggled) this.click();
  };


  // create returns a Button instance for the given domID. If the instance
  // already exists then the instance is returned, if not then a new instance
  // is returned.
  // Arguments:
  //   domID: A CSS style id selector.
  Button.create = function (domID) {
    var $element = $(domID);
    var buttonInstance = $element.data(_DATA_FIELD_KEY);
    return buttonInstance ? buttonInstance : new Button(domID);
  };

  
  return Button;
});
