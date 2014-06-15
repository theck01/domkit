define(['jquery'], function ($) {
  // ButtonInstance extends the HTML button element, giving default behaviors.
  // Arguments:
  //   $domElement: A single jQuery dom element.
  //   toggleable: Boolean, whether the element should become active when
  //       clicked.
  //   opt_isToggled: Boolean, whether the element is toggled or not. By
  //       default buttons are not toggled
  //
  var ButtonInstance = function ($domElement, toggleable, opt_isToggled) {
    this._element = $domElement;
    this._toggleable = toggleable;
    this._toggled = !!opt_isToggled;
    this._handlers = Object.create(null);
    this._mouseDown = false;

    this._handlers.mousePress = this._handlePress.bind(this);
    this._handlers.mouseRelease = this._handleRelease.bind(this);
    this._handlers.mouseLeave = this._handleLeave.bind(this);

    this._element.bind('mousedown', this._handlers.mousePress);
    this._element.bind('mouseup', this._handlers.mouseRelease);
    this._element.bind('mouseleave', this._handlers.mouseLeave);
  };


  // destroy removes all callback handlers from the element
  ButtonInstance.prototype.destroy = function () {
    this._element.unbind('mousedown', this._handlers.mousePress);
    this._element.unbind('mouseup', this._handlers.mouseRelease);
    this._element.unbind('mouseleave', this._handlers.mouseLeave);
  };


  // mousedown handler
  ButtonInstance.prototype._handlePress = function () {
    if (this._toggleable) {
      if (this._toggled) {
        this._element.addClass('dk-toggleable-button-active-pressed');
        this._element.removeClass('dk-toggleable-button-active');
      } else {
        this._element.addClass('dk-toggleable-button-pressed');
        this._element.removeClass('dk-toggleable-button');
      }
    } else {
      this._element.addClass('dk-button-pressed');
      this._element.removeClass('dk-button');
    }

    this._mouseDown = true;
  };


  // mouseup handler
  ButtonInstance.prototype._handleRelease = function () {
    if (this._toggleable) {
      this._toggled = !this._toggled;

      if (this._toggled) {
        this._element.addClass('dk-toggleable-button-active');
        this._element.removeClass('dk-toggleable-button-pressed');
      } else {
        this._element.addClass('dk-toggleable-button');
        this._element.removeClass('dk-toggleable-button-active-pressed');
      }
    } else {
      this._element.addClass('dk-button');
      this._element.removeClass('dk-button-pressed');
    }

    this._mouseDown = false;
  };


  // mouseleave handler
  ButtonInstance.prototype._handleLeave = function () {
    if (this._mouseDown) {
      if (this._toggleable) {
        if (this._toggled) {
          this._element.addClass('dk-toggleable-button-active');
          this._element.removeClass('dk-toggleable-button-active-pressed');
        } else {
          this._element.addClass('dk-toggleable-button');
          this._element.removeClass('dk-toggleable-button-pressed');
        }
      } else {
        this._element.addClass('dk-button');
        this._element.removeClass('dk-button-pressed');
      }
    }

    this._mouseDown = false;
  };


  // List of all active ButtonInstances
  var instances = [];

  // Buttons singleton, which sole purpose is to add functionallity to buttons
  // with the .dk-button (or related) class.
  var Buttons = Object.create(null);


  // Refresh behavior on any buttons currently present in the DOM. SHOULD NOT
  // BE CALLED WHEN CLICKING A .dk-button OR RELATED.
  Buttons.refresh = function () {
    // Destroy all existing button instances.
    for (var i = 0; i < instances.length; i++) {
      instances[i].destroy();
    }

    instances = [];

    // Instantiate new button instances for each .dk-button in the dom.
    $('.dk-button').each(function (i, element) {
      instances.push(new ButtonInstance($(element), false));
    });

    // Instantiate new button instances for each .dk-toggleable-button in the
    // dom.
    $('.dk-toggleable-button').each(function (i, element) {
      instances.push(new ButtonInstance($(element), true));
    });

    // Instantiate new button instances for each .dk-toggleable-button-active
    // in the dom.
    $('.dk-toggleable-button-active').each(function (i, element) {
      instances.push(new ButtonInstance($(element), true, true));
    });
  };

  // Automatically update buttons on load of script.
  Buttons.refresh();

  return Buttons;
});
