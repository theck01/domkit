define(
    ['jquery', 'domkit/domkit', 'domkit/util/touchclickcanceller'],
    function ($, Domkit, TouchClickCanceller) {
  var _DATA_FIELD_KEY = '_data_dk_object';

  // Base extends any HTML element, giving providing common behaviors for all
  // domkit ui elements.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  //   opt_createClickCancel: optional, prevents active click cancelling on
  //       touch events.
  var Base = function (jQueryOrDomID, opt_preventClickCancel) {
    var $element = Domkit.validateOrRetrieveJQueryObject(jQueryOrDomID);

    this._$element = $element;
    this._canceller = !opt_preventClickCancel ?
        TouchClickCanceller.create($element) : null;
    
    $element.data(_DATA_FIELD_KEY, this);
  };


  // Whether the element cancels clicks when processing touch events.
  Base.prototype.cancelsTouchGeneratedClicks = function () {
    return !!this._canceller;
  };


  // destroy the domkit ui element.
  Base.prototype.destroy = function () {
    if (this._canceller) {
      this._canceller.destroy();
      this._canceller = null;
    }

    this._$element.data(_DATA_FIELD_KEY, null);
  };


  // getElement returns the jQuery object that the domkit ui element is built
  // upon.
  Base.prototype.getElement = function () {
    return this._$element;
  };


  // create returns a domkit ui element for the given domID. If the instance
  // already exists then the instance is returned, if not then a new instance
  // is returned.
  // Arguments:
  //   elementConstructor: function taking the element identifier and whether
  //       to cancel clicks.
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  //   opt_createClickCancel: optional, prevents active click cancelling on
  //       touch events.
  Base.create = function (
      elementConstructor, jQueryOrDomID, opt_preventClickCancel) {
    var $element = Domkit.validateOrRetrieveJQueryObject(jQueryOrDomID);
    var elementInstance = $element.data(_DATA_FIELD_KEY);
    return elementInstance ?
      elementInstance :
      new elementConstructor($element, opt_preventClickCancel);
  };

  return Base;
});
