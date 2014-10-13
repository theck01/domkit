define(['jquery', 'domkit/domkit'], function ($, Domkit) {
  var _DATA_FIELD_KEY = '_data_dk_tooltip_object';
  var _OFFSET_FROM_BOTTOM = -10;
  var _OFFSET_FROM_CENTER = 0;
  var _SHOW_OPACITY = 0.8;
  var _TRANSITION_DURATION = 300;

  // Tooltip instances superimpose a tooltip element on another page element to
  // provide context on the purpose or use of a that element when that element
  // is hovered over. The new instance will display the tooltip on hover over
  // the tooltip's parent element.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object for the tooltip.
  //   opt_displayDelay: Delay between hover event and when the tooltip
  //       displays, in milliseconds
  var Tooltip = function (jQueryOrDomID, opt_displayDelay) {
    this._$tooltip = Domkit.validateOrRetrieveJQueryObject(jQueryOrDomID);
    this._$element = this._$tooltip.parent();
    this._displayDelay = opt_displayDelay || 0;
    this._timeoutCallbackId = null;

    this._boundMethods = Object.create(null);
    this._boundMethods.show = this._show.bind(this);

    this._interactionHandlers = Object.create(null);
    this._interactionHandlers.mouseEnter = this._handleEnter.bind(this);
    this._interactionHandlers.mouseLeave = this._hide.bind(this);


    this._$element.bind('mouseenter', this._interactionHandlers.mouseEnter);
    this._$element.bind('mouseleave', this._interactionHandlers.mouseLeave);

    this._$element.data(_DATA_FIELD_KEY, this);

    // Remove the tooltip and reattach to the body, to ensure proper
    // positioning within the page.
    this._$tooltip.detach();
    $('body').append(this._$tooltip);
  };


  // Cancel timeout callback
  Tooltip.prototype._cancelTimeout = function () {
    if (this._timeoutCallbackId !== null) {
      clearTimeout(this._timeoutCallbackId);
      this._timeoutCallbackId = null;
    }
  };


  // Handle mouseenter events
  Tooltip.prototype._handleEnter = function () {
    if (this._timeoutCallbackId !== null) {
      this._cancelTimeout();
      this._show();
    } else if (this._displayDelay) {
      this._timeoutCallbackId = setTimeout(
          this._boundMethods.show, this._displayDelay);
    } else {
      this._show();
    }
  };


  // Hide the tooltip, and cancel any pending appearnces of the tooltip.
  Tooltip.prototype._hide = function () {
    this._cancelTimeout();
    this._$tooltip.fadeOut(_TRANSITION_DURATION);
  };


  // Show the tooltip.
  Tooltip.prototype._show = function () {
    this._timeoutCallbackId = null;

    var elementPosition = this._$element.offset();
    var tooltipTop = elementPosition.top + this._$element.height() +
          _OFFSET_FROM_BOTTOM;
    var tooltipLeft = elementPosition.left + this._$element.width() / 2 +
          _OFFSET_FROM_CENTER;

    var tooltipShowCSS = {'top': tooltipTop, 'left': tooltipLeft };

    this._$tooltip.css(tooltipShowCSS);
    this._$tooltip.fadeIn(_TRANSITION_DURATION);
  };


  // create returns a Button instance for the given domID. If the instance
  // already exists then the instance is returned, if not then a new instance
  // is returned.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  //   opt_displayDelay: Delay between hover event and when the tooltip
  //       displays, in milliseconds
  Tooltip.create = function (jQueryOrDomID, opt_displayDelay) {
    var $tooltip = Domkit.validateOrRetrieveJQueryObject(jQueryOrDomID);
    var tooltipInstance = $tooltip.data(_DATA_FIELD_KEY);
    return tooltipInstance ?
        tooltipInstance :
        new Tooltip($tooltip, opt_displayDelay);
  };


  // createAll initializes all tooltips in the document as domkit tooltips.
  // Arguments:
  //   opt_displayDelay: Delay between hover event and when the tooltip
  //       displays, in milliseconds
  Tooltip.createAll = function (opt_displayDelay) {
    $('.dk-tooltip').each(function () {
      Tooltip.create($(this), opt_displayDelay);
    });
  };


  return Tooltip;
});
