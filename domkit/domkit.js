define(['jquery'], function ($) {
  // Domkit collection of utility functions.
  var Domkit = Object.create(null);


  // validateOrRetrieveJQueryObject retrieves the jQuery object given a
  // jQuery object or DOM ID
  // Arguments:
  //   jQueryOrID: A jQuery object or a DOM ID for a element.
  Domkit.validateOrRetrieveJQueryObject = function (jQueryOrID) {
    if (jQueryOrID instanceof $) return jQueryOrID;
    else if (typeof jQueryOrID === 'string') {
      var $element = $(jQueryOrID);
      if ($element.length === 1) return $element;
    }

    throw Error(
        'Cannot validate the argument as a jQuery object or retrieve a ' +
        'jQuery object using the argument as a DOM ID.');
  };

  
  return Domkit;
});
