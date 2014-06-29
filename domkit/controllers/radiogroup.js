define([], function () {
  // A toggle radio group controls a group of toggleable elements, allowing
  // only one of the group of the elements to be active at any one time. Resets
  // all elements toggle state to false on creation.
  // Arguments:
  //   elements: An array of toggleable element instances.
  //   opt_activeIndex: The index of the element within the elements array that
  //       should start as toggled.
  var RadioGroup = function (elements, opt_activeIndex) {
    this._activeIndex = opt_activeIndex === undefined ? -1 : opt_activeIndex;
    this._toggleableElements = [];
    this._toggleHandlers = this._generateHandlers(elements.length);

    for (var i = 0; i < elements.length; i++) {
      this._assertElementIsToggleable(elements[i]);

      if (elements[i].getState() && i !== opt_activeIndex) {
        elements[i].setState(false);
      }
      this._toggleableElements.push(elements[i]);
      this._toggleableElements[i].addStateHandler(this._toggleHandlers[i]);
    }

    if (opt_activeIndex !== undefined &&
        !this._toggleableElements[opt_activeIndex].getState()) {
      this._toggleableElements[opt_activeIndex].setState(true);
    }
  };


  // Asserts that the element in question is a toggleable element.
  // Arguments:
  //   element: The element to assert is toggleable.
  RadioGroup.prototype._assertElementIsToggleable = function (element) {
    if (!element.isToggleable || !element.isToggleable() ||
        !element.getState || !element.setState || !element.addStateHandler ||
        !element.removeStateHandler) {
      throw Error(
          'Cannot add non togglable element to a toggle radio group. A ' +
          'toggleable element has an isToggleable method which returns ' +
          'true, a getState method, a setState method, an addStateHandler, ' +
          'method, and a removeStateHandler method.');
    }
  };


  // clear the active element in the radio group, if one exists.
  RadioGroup.prototype.clear = function () {
    if (this._activeIndex < 0) return;
    this._toggleableElements[this._activeIndex].setState(false);
  };


  // destroy the radio group, removing all handers from the elements
  RadioGroup.prototype.destroy = function () {
    for (var i = 0; i < this._toggeableElements; i++) {
      this._toggleableElements[i].removeStateHandler(
          this._toggleHandlers[i]);
    }

    this._toggleHandlers = [];
    this._toggeableElements = [];
    this._activeIndex = -1;
  };


  // _generateHandlers creates the given number of state change handlers.
  // Arguments:
  //   numHandlers: The number of toggle handlers to generate
  // Returns and array of handler functions, each taking a boolean value for
  // the state of the assoicated element.
  RadioGroup.prototype._generateHandlers = function (numElements) {
    var toggleHandlers = [];
    var stateChangeHandler = this._handleStateChange.bind(this);

    for (var i = 0; i < numElements; i++) {
      var handler = (function (elementIndex) {
        return stateChangeHandler.bind(stateChangeHandler, elementIndex);
      })(i);

      toggleHandlers.push(handler);
    }

    return toggleHandlers;
  };


  // getActiveElement returns the element currently active within the radio
  // group, or null if no element is active.
  RadioGroup.prototype.getActiveElement = function () {
    if (this._activeIndex === -1) return null;
    return this._toggleableElements[this._activeIndex];
  };


  // _handleStateChange of the element at the given index.
  // Arguments:
  //   elementIndex: The index of the element that changed state.
  //   state: The state of the element after the change.
  RadioGroup.prototype._handleStateChange = function (elementIndex, state) {
    if (this._activeIndex === elementIndex) {
      if (!state) this._activeIndex = -1;
      return;
    }

    if (state) {
      if (this._activeIndex >= 0) {
        this._toggleableElements[this._activeIndex].setState(false);
      }
      this._activeIndex = elementIndex;
    }
  };
  

  return RadioGroup;
});
