define(
    ['jquery', 'domkit/domkit', 'domkit/util/handlercollection'],
    function ($, Domkit, HandlerCollection) {

  var _DATA_FIELD_KEY = '_data_dk_button_object';


  // Button extends the HTML button element, giving default behaviors.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  var Button = function (jQueryOrDomID) {
    HandlerCollection.call(this);

    this._disabled = false;
    this._$element = Domkit.validateOrRetrieveJQueryObject(jQueryOrDomID);
    this._toggleable = this._$element.hasClass('dk-toggleable-button') ||
        this._$element.hasClass('dk-toggleable-button-active');
    this._toggled = this._toggleable &&
        this._$element.hasClass('dk-toggleable-button-active');
    this._interactionHandlers = Object.create(null);
    this._mouseDown = false;

    this._interactionHandlers.mousePress = this._handlePress.bind(this);
    this._interactionHandlers.mouseRelease = this._handleRelease.bind(this);
    this._interactionHandlers.mouseLeave = this._handleLeave.bind(this);

    this._$element.bind('mousedown', this._interactionHandlers.mousePress);
    this._$element.bind('mouseup', this._interactionHandlers.mouseRelease);
    this._$element.bind('mouseleave', this._interactionHandlers.mouseLeave);

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
    this._$element.unbind('mousedown', this._interactionHandlers.mousePress);
    this._$element.unbind('mouseup', this._interactionHandlers.mouseRelease);
    this._$element.unbind('mouseleave', this._interactionHandlers.mouseLeave);

    this._$element.data(_DATA_FIELD_KEY, null);
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


  // _handlePress mousedown handler
  Button.prototype._handlePress = function () {
    if (this._disabled) return;

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


  // _handleRelease mouseup handler
  Button.prototype._handleRelease = function () {
    if (this._disabled) return;

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
    this._callHandlers(this._toggled);
  };


  // _handleLeave mouseleave handler
  Button.prototype._handleLeave = function () {
    if (this._disabled) return;

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
    $('.dk-toggleable-button').each(function () {
      Button.create($(this));
    });
    $('.dk-toggleable-button-active').each(function () {
      Button.create($(this));
    });
  };

  
  return Button;
});
