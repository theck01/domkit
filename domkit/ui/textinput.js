define(['jquery', 'domkit/ui/base'], function ($, Base) {
  // TextInput extends the HTML input element, giving default behaviors.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  //   opt_createClickCancel: optional, prevents active click cancelling on
  //       touch events.
  var TextInput = function (jQueryOrDomID, opt_preventClickCancel) {
    Base.call(this, jQueryOrDomID, opt_preventClickCancel);
    var $element = this.getElement();

    this._previousVal = '';
    
    // Focus the input field on touch end if click events are cancelled.
    if (this.cancelsTouchGeneratedClicks()) {
      $element.on('touchend', function () {
        $element.focus();
      });
    }

    // Clear the input field on focus.
    $element.on('focus', function () {
      this._previousVal = $element.val();
      $element.val('');
    });

    // Style the element if it is not already styled appropriately.
    if (!$element.hasClass('dk-text-input')) {
      $element.addClass('dk-text-input');
    }
  };
  TextInput.prototype = Object.create(Base.prototype);
  TextInput.prototype.constructor = TextInput;


  // create returns a TextInput instance for the given domID. If the instance
  // already exists then the instance is returned, if not then a new instance
  // is returned.
  // Arguments:
  //   jQueryOrDomID: A CSS style id selector or jQuery object.
  //   opt_createClickCancel: optional, prevents active click cancelling on
  //       touch events.
  TextInput.create = function (jQueryOrDomID, opt_preventClickCancel) {
    return Base.create(TextInput, jQueryOrDomID, opt_preventClickCancel);
  };


  // createAll initializes all buttons in the document as domkit buttons.
  TextInput.createAll = function () {
    $('.dk-text-input').each(function () {
      TextInput.create($(this));
    });
  };


  return TextInput;
});
