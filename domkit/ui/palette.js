define(
    ['jquery', 'domkit/domkit', 'domkit/util/handlercollection'],
    function ($, Domkit, HandlerCollection) {
  // Palette objects are rectangular menus with rounded corners that are
  // anchored to a location on the page by a triangular point.
  // Arguments:
  //   params: Object with the following key and value pairs.
  //     sibling: CSS DOM ID of the DOM element to which the palette is
  //         attached or a single jQuery element.
  //     anchorEdge: The edge of the element to which the palette is anchored.
  //         One of Palette.ANCHOR_EDGES.
  //     menu: CSS DOM ID of the root node of the menu to detach from the DOM
  //         or a jQuery object root of a DOM based menu that the palette will
  //         contain. This DOM tree must be sized completely class based rules,
  //         per element rules will be overwritten by the palette.
  //     isVisible: Optional, whether the palette should be shown when created.
  //         Defaults to false.
  //     anchorEdgeBounds: Optional, an object with 'min' and 'max' fields.
  //         The space in which the anchor edge can exist, must be larger than
  //         that edge of the palette or an error will be thrown.
  var Palette = function (params) {
    this._anchorBorderOffset = { x: 0, y: 0 };
    this._anchorEdge = _OPPOSITE_ANCHOR_EDGES[params.anchorEdge];
    this._anchorEdgeBounds = params.anchorEdgeBounds || {
      min: -Infinity, max: Infinity
    };
    this._anchorOffset = { x: 0, y: 0 };
    this._isVisible = !!params.isVisible;
    this._domCache = {
      palette: null,
      paletteAnchor: null,
      paletteAnchorBorder: null,
      paletteMenuContainer: null,
      paletteMenu: null
    };
    this._paletteOffset = { x: 0, y: 0 };
    this._sizingCache = {
      anchorHeight: null,
      borderWidth: null,
      innerAnchorOffset: null,
      menuContainerPadding: null,
      paletteDimensions: null
    };
    this._$sibling = Domkit.validateOrRetrieveJQueryObject(params.sibling);
    this._visibleStateHandlers = new HandlerCollection();
    this._delayedVisibleStateHandlers = new HandlerCollection();

    var callDelayedHandlers = function (isVisible) {
      setTimeout(
          this._delayedVisibleStateHandlers._callHandlers.bind(
              this._delayedVisibleStateHandlers, isVisible),
          _PALETTE_TRANSITION_DURATION);
    };
    this._visibleStateHandlers._addHandler(callDelayedHandlers.bind(this));

    this._anchorPosition = this._calculateAnchorPosition();
    this._$menu = Domkit.validateOrRetrieveJQueryObject(params.menu);
    if (this._$menu.parent().length > 0) this._$menu.detach();

    this._initializeDOM();

    // Initialize dimensions object after initializing the DOM, the menu may
    // not have accurate dimensions before it has been added to the DOM.
    this._dimensions = { 
      width: this._$menu.outerWidth(true /* include margins */),
      height: this._$menu.outerHeight(true /* include margins */)
    };

    $(window).bind('resize', this._onWindowResize.bind(this));

    this._initializeSizings();
    this._updateAnchorOffsets();
    this._updatePaletteOffset();
    if (this._isVisible) this._updateDOM();
    else this._hideDOM();
  };


  // ANCHOR_EDGES enumeration of the edge which can be anchored to 
  Palette.ANCHOR_EDGES = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right'
  };

  // _OPPOSITE_ANCHOR_EDGES map of ANCHOR_EDGES edge to opposite ANCHOR_EDGES
  // edge.
  var _OPPOSITE_ANCHOR_EDGES = {};
  _OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.TOP] =
      Palette.ANCHOR_EDGES.BOTTOM;
  _OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.LEFT] =
      Palette.ANCHOR_EDGES.RIGHT;
  _OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.RIGHT] =
      Palette.ANCHOR_EDGES.LEFT;
  _OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.BOTTOM] =
      Palette.ANCHOR_EDGES.TOP;

  // Class that prevents the element from having a transition applied when the
  // palette is hidden/shown.
  Palette.NO_TRANSITION_CLASS = 'dk-palette-no-transition';

  // Number of pixels to offset the anchor point from the anchored elements
  // edge.
  var _EDGE_OFFSET = 1;

  // CSS values when hiding palette and children
  var _PALETTE_HIDE_CSS = {
    'top': 0, 'left': 0, 'width': 0, 'height': 0, 'border-width': 0,
    'padding': 0, 'margin': 0, 'opacity': 0, 'font-size': 0
  };

  // CSS class for hide transition
  var _PALETTE_HIDE_CLASS = 'dk-palette-disappear-transition';

  // CSS values when showing hidden palette and children
  var _PALETTE_SHOW_CSS = {
    'top': '', 'left': '', 'width': '', 'height': '', 'border-width': '',
    'padding': '', 'margin': '', 'opacity': '', 'font-size': ''
  };

  // CSS class for show transition
  var _PALETTE_SHOW_CLASS = 'dk-palette-appear-transition';

  // Duration of palette show/hide transition
  var _PALETTE_TRANSITION_DURATION = 450;


  // addVisibleStateHandler registers a function to handle visibility changes
  // of the palette.
  //
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the palette is
  //       visible.
  Palette.prototype.addVisibleStateHandler = function (handler) {
    this._visibleStateHandlers._addHandler(handler); 
  };


  // addDelayedVisibleStateHandler registers a function to handle visibility
  // changes of the palette after the palette has transitioned to the new
  // visibility state.
  //
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the palette is
  //       visible.
  Palette.prototype.addDelayedVisibleStateHandler = function (handler) {
    this._delayedVisibleStateHandlers._addHandler(handler); 
  };


  // _changeMenuElementsVisibility updates the elements in the tree starting
  // at the $root node with the style to show or hide those nodes with a
  // transition
  //
  // Arguments:
  //   $root: The jQuery object for the root node of the menu subtree.
  //   hidden: Whether the nodes in the subtree should be hidden or not.
  Palette.prototype._changeMenuElementsVisibility = function ($root, hidden) {
    var palette = this;
    $root.children().each(function () {
      palette._changeMenuElementsVisibility($(this), hidden);
    });

    var newClass = _PALETTE_SHOW_CLASS;
    var oldClass = _PALETTE_HIDE_CLASS;
    var newCSS = _PALETTE_SHOW_CSS;
    if (hidden) {
      newClass = _PALETTE_HIDE_CLASS;
      oldClass = _PALETTE_SHOW_CLASS;
      newCSS = _PALETTE_HIDE_CSS;
    }

    if (!$root.hasClass(Palette.NO_TRANSITION_CLASS)) {
      $root.addClass(newClass);
      $root.removeClass(oldClass);
      $root.css(newCSS);
    }
  };


  // bound updates the range to which the palette's anchor edge is restricted.
  // Arguments:
  //   boundingRange: Optional, an object with 'min' and 'max'
  Palette.prototype.bound = function (boundingRange) {
    this._anchorEdgeBounds = boundingRange;
  };


  // _calculateAnchorPosition calculates the anchor position of the palette so
  // that the palette is attached to the appropriate edge of the sibling
  // element.
  Palette.prototype._calculateAnchorPosition = function () {
    var siblingPosition = this._$sibling.offset();
    var position = { x: siblingPosition.left, y: siblingPosition.top };

    switch (this._anchorEdge) {
      case Palette.ANCHOR_EDGES.TOP:
        position.x += Math.floor(this._$sibling.outerWidth() / 2);
        position.y += this._$sibling.outerHeight() + _EDGE_OFFSET;
        break;

      case Palette.ANCHOR_EDGES.LEFT:
        position.x += this._$sibling.outerWidth() + _EDGE_OFFSET;
        position.y += Math.floor(this._$sibling.outerHeight() / 2);
        break;

      case Palette.ANCHOR_EDGES.RIGHT:
        position.x -= _EDGE_OFFSET;
        position.y += Math.floor(this._$sibling.outerHeight() / 2);
        break;

      case Palette.ANCHOR_EDGES.BOTTOM:
        position.x += Math.floor(this._$sibling.outerWidth() / 2);
        position.y -= _EDGE_OFFSET;
        break;

      default:
        throw Error(
            'Cannot calculate anchor position when bound to nonstandard ' +
            'edge ' + this._anchorEdge);
    }

    return position;
  };


  // getMenuDiv returns the jQuery object for the palette div that contains all
  // elements in the palette menu.
  Palette.prototype.getMenuElement = function () {
    return this._domCache.paletteMenu;
  };


  // _hideDOM collapses palette to the anchor origin point, hiding the contents
  // from view
  Palette.prototype._hideDOM = function () {
    // Ensure that the positions of the DOM are as up to date as possible.
    this._anchorPosition = this._calculateAnchorPosition();
    this._updateAnchorOffsets();
    this._updatePaletteOffset();

    var hiddenPaletteProperties = {
      'top': this._anchorPosition.y,
      'left': this._anchorPosition.x,
      'width': 0,
      'height': 0
    };

    var hiddenComponentProperties = {
      'top': 0,
      'left': 0,
      'width': 0,
      'height': 0,
      'border-width': 0,
      'padding': 0
    };

    // Ensure that the palette has transition classes, which may have been
    // removed while shifting the palette within the window.
    this._domCache.palette.addClass('dk-palette-appear-transition');
    this._domCache.paletteAnchor.addClass('dk-palette-appear-transition');
    this._domCache.paletteAnchorBorder.addClass('dk-palette-appear-transition');

    this._domCache.palette.css(hiddenPaletteProperties);
    this._domCache.paletteAnchor.css(hiddenComponentProperties);
    this._domCache.paletteAnchorBorder.css(hiddenComponentProperties);
    this._domCache.paletteMenuContainer.css(hiddenComponentProperties);
    this._domCache.paletteMenu.css(hiddenComponentProperties);

    this._changeMenuElementsVisibility(this._$menu, true /* hidden */);
  };


  // _initializeDOM clears any children of the palette div and adds palette
  // specific DOM children. Must not depend on knowing palette dimensions,
  // which cannot be accurately determined before the menu has been added to
  // the DOM
  Palette.prototype._initializeDOM = function () {
    var $body = $('body');

    this._domCache.palette = $('<div/>', {
      'class': 'dk-palette dk-palette-appear-transition'
    });
    if (!this._isVisible) this._domCache.palette.hide();
    $body.append(this._domCache.palette);

    this._domCache.paletteMenuContainer = $('<div/>', {
      'class': 'dk-palette-menu-container dk-palette-appear-transition',
    });
    this._domCache.palette.append(this._domCache.paletteMenuContainer);

    this._domCache.paletteMenu = $('<div/>', {
      'class': 'dk-palette-menu dk-palette-appear-transition'
    });
    this._domCache.paletteMenuContainer.append(this._domCache.paletteMenu);
    this._domCache.paletteMenu.append(this._$menu);

    this._domCache.paletteAnchorBorder = $('<div/>', {
      'class': 'dk-palette-anchor-border-' + this._anchorEdge + ' ' +
          'dk-palette-appear-transition',
    });
    this._domCache.palette.append(this._domCache.paletteAnchorBorder);

    this._domCache.paletteAnchor = $('<div/>', {
      'class': 'dk-palette-anchor-' + this._anchorEdge + ' ' +
          'dk-palette-appear-transition',
    });
    this._domCache.palette.append(this._domCache.paletteAnchor);
  };


  // _initializeSizings sets the values for the sizings of palette parameters,
  // pulled from the css properties set on the elements making up the palette.
  Palette.prototype._initializeSizings = function () {
    var borderWidthProperty =
        'border-' + _OPPOSITE_ANCHOR_EDGES[this._anchorEdge] + '-width';

    this._sizingCache.anchorHeight = parseInt(
        this._domCache.paletteAnchor.css(borderWidthProperty), 10);
    this._sizingCache.borderWidth = parseInt(
        this._domCache.paletteMenuContainer.css('border-top-width'), 10);
    this._sizingCache.innerAnchorOffset =
        Math.floor(this._sizingCache.borderWidth * Math.sqrt(2)) + 1;
    this._sizingCache.menuContainerPadding = parseInt(
        this._domCache.paletteMenuContainer.css('padding-top'), 10);

    this._sizingCache.paletteDimensions = {
      width:
          this._dimensions.width + 2 * this._sizingCache.menuContainerPadding +
          2 * this._sizingCache.borderWidth,
      height:
          this._dimensions.height + 2 * this._sizingCache.menuContainerPadding +
          2 * this._sizingCache.borderWidth
    };

    var anchoredEdgeDimension =
        this._anchorEdge === Palette.ANCHOR_EDGES.LEFT ||
        this._anchorEdge === Palette.ANCHOR_EDGES.RIGHT ? 'width' : 'height';

    this._sizingCache.paletteDimensions[anchoredEdgeDimension] +=
        this._sizingCache.anchorHeight;
  };


  // _onWindowResize handles updating palette elements to ensure that the
  // palette is properly positioned within the window and attached to the
  // element.
  Palette.prototype._onWindowResize = function () {
    this._anchorPosition = this._calculateAnchorPosition();
    this._updateAnchorOffsets();
    this._updatePaletteOffset();
    this._shiftDOM();
  };


  // removeVisibleStateHandler removes a function should no longer handle
  // visibility changes of the palette.
  //
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the palette is
  //       visible.
  Palette.prototype.removeVisibleStateHandler = function (handler) {
    this._visibleStateHandlers._removeHandler(handler); 
  };

  // removeDelayedVisibleStateHandler removes a function should no longer
  // handle visibility changes of the palette after the palette has transitioned
  // to the new visibility state.
  //
  // Arguments:
  //   handler: Function that takes a boolean argument, whether the palette is
  //       visible.
  Palette.prototype.removeDelayedVisibleStateHandler = function (handler) {
    this._delayedVisibleStateHandlers._addHandler(handler); 
  };


  // _shiftDOM shifts DOM elements to positions dictated by anchor offsets and
  // palette offsets.
  Palette.prototype._shiftDOM = function () {
    this._domCache.palette.removeClass('dk-palette-appear-transition');
    this._domCache.palette.css({
      'top': this._paletteOffset.y,
      'left': this._paletteOffset.x,
    });

    if (this._isVisible) {
      this._domCache.paletteAnchor.removeClass('dk-palette-appear-transition');
      this._domCache.paletteAnchor.css({
        'top': this._anchorOffset.y - this._paletteOffset.y,
        'left': this._anchorOffset.x - this._paletteOffset.x,
      });

      this._domCache.paletteAnchorBorder.removeClass(
          'dk-palette-appear-transition');
      this._domCache.paletteAnchorBorder.css({
        'top': this._anchorBorderOffset.y - this._paletteOffset.y,
        'left': this._anchorBorderOffset.x - this._paletteOffset.x,
      });
    }
  };


  // _updateAnchorOffsets updates the offset for the palette anchor and palette
  // anchor children.
  Palette.prototype._updateAnchorOffsets = function () {
    var halfAnchorHeight = Math.floor(this._sizingCache.anchorHeight / 2);

    switch (this._anchorEdge) {
      case Palette.ANCHOR_EDGES.TOP:
        this._anchorOffset.x = this._anchorPosition.x - halfAnchorHeight;
        this._anchorOffset.y =
            this._anchorPosition.y + this._sizingCache.innerAnchorOffset;
        this._anchorBorderOffset.x =
            this._anchorPosition.x - halfAnchorHeight;
        this._anchorBorderOffset.y = this._anchorPosition.y;
        break;

      case Palette.ANCHOR_EDGES.LEFT:
        this._anchorOffset.x =
            this._anchorPosition.x + this._sizingCache.innerAnchorOffset;
        this._anchorOffset.y = this._anchorPosition.y - halfAnchorHeight;
        this._anchorBorderOffset.x = this._anchorPosition.x;
        this._anchorBorderOffset.y = 
            this._anchorPosition.y - halfAnchorHeight;
        break;

      case Palette.ANCHOR_EDGES.RIGHT:
        this._anchorOffset.x =
            this._anchorPosition.x - this._sizingCache.anchorHeight -
            this._sizingCache.innerAnchorOffset;
        this._anchorOffset.y = this._anchorPosition.y - halfAnchorHeight;
        this._anchorBorderOffset.x = 
            this._anchorPosition.x - this._sizingCache.anchorHeight;
        this._anchorBorderOffset.y = 
            this._anchorPosition.y - halfAnchorHeight;
        break;

      case Palette.ANCHOR_EDGES.BOTTOM:
        this._anchorOffset.x = this._anchorPosition.x - halfAnchorHeight;
        this._anchorOffset.y =
            this._anchorPosition.y - this._sizingCache.anchorHeight -
            this._sizingCache.innerAnchorOffset;
        this._anchorBorderOffset.x =
            this._anchorPosition.x - halfAnchorHeight;
        this._anchorBorderOffset.y =
            this._anchorPosition.y - this._sizingCache.anchorHeight;
        break;

      default:
        throw Error('Cannot update offset for anchors on unknown edge.');
    }
  };


  // _updateDOM applies the current palette state to the DOM elements that
  // make up the palette.
  Palette.prototype._updateDOM = function () {
    // Ensure that the positions of the DOM are as up to date as possible.
    this._anchorPosition = this._calculateAnchorPosition();
    this._updateAnchorOffsets();
    this._updatePaletteOffset();

    // Ensure that the palette has transition classes, which may have been
    // removed while shifting the palette within the window.
    this._domCache.palette.addClass('dk-palette-appear-transition');
    this._domCache.paletteAnchor.addClass('dk-palette-appear-transition');
    this._domCache.paletteAnchorBorder.addClass('dk-palette-appear-transition');

    this._domCache.palette.css({
      'top': this._paletteOffset.y,
      'left': this._paletteOffset.x,
      'width': this._sizingCache.paletteDimensions.width,
      'height': this._sizingCache.paletteDimensions.height,
      'border-width': '',
      'padding': ''
    });

    this._domCache.paletteAnchor.css({
      'top': this._anchorOffset.y - this._paletteOffset.y,
      'left': this._anchorOffset.x - this._paletteOffset.x,
      'border-width': '',
      'padding': ''
    });

    this._domCache.paletteAnchorBorder.css({
      'top': this._anchorBorderOffset.y - this._paletteOffset.y,
      'left': this._anchorBorderOffset.x - this._paletteOffset.x,
      'border-width': '',
      'padding': ''
    });

    var menuContainerOffset = {
      'top': 0,
      'left': 0,
      'width': this._dimensions.width,
      'height': this._dimensions.height,
      'border-width': '',
      'padding': ''
    };

    if (this._anchorEdge === Palette.ANCHOR_EDGES.TOP) {
        menuContainerOffset.top += this._sizingCache.anchorHeight;
    } else if (this._anchorEdge === Palette.ANCHOR_EDGES.LEFT) {
        menuContainerOffset.left += this._sizingCache.anchorHeight;
    }

    this._domCache.paletteMenuContainer.css(menuContainerOffset);

    this._domCache.paletteMenu.css({
      'top': this._sizingCache.menuContainerPadding,
      'left': this._sizingCache.menuContainerPadding,
      'width': this._dimensions.width,
      'height': this._dimensions.height,
      'border-width': '',
      'padding': ''
    });

    this._changeMenuElementsVisibility(this._$menu, false /* hidden */);
  };


  // _updatePaletteOffset updates the offset for the menu container
  // child of the palette, attempting to keep the container within the
  // constrained edge bounds.
  Palette.prototype._updatePaletteOffset = function () {
    var constrainedDimension =
        this._anchorEdge === Palette.ANCHOR_EDGES.TOP ||
        this._anchorEdge === Palette.ANCHOR_EDGES.BOTTOM ? 'x' : 'y';
    var unconstrainedDimension =
        constrainedDimension === 'x' ? 'y' : 'x';
    var constrainedDimensionProperty =
        constrainedDimension === 'x' ? 'width' : 'height';
    var unconstrainedDimensionProperty =
        constrainedDimension === 'x' ? 'height' : 'width';

    var paletteDimensions = this._sizingCache.paletteDimensions;
    var originalRange = {
      min: this._anchorPosition[constrainedDimension] -
          Math.floor(paletteDimensions[constrainedDimensionProperty] / 2),
      max: this._anchorPosition[constrainedDimension] +
          Math.ceil(paletteDimensions[constrainedDimensionProperty] / 2)
    };
    var connectionBoundingRange = {
      min: this._anchorPosition[constrainedDimension] -
          paletteDimensions[constrainedDimensionProperty] +
          Math.floor(this._sizingCache.anchorHeight / 2),
      max: this._anchorPosition[constrainedDimension] +
          paletteDimensions[constrainedDimensionProperty] -
          Math.ceil(this._sizingCache.anchorHeight / 2)
    };
    var boundingRange = {
      min: Math.max(connectionBoundingRange.min, this._anchorEdgeBounds.min),
      max: Math.min(connectionBoundingRange.max, this._anchorEdgeBounds.max)
    };
    var constrainedRange = { min: originalRange.min, max: originalRange.max };

    var lowerOffset = constrainedRange.min < boundingRange.min ?
        boundingRange.min - constrainedRange.min : 0;
    constrainedRange.min += lowerOffset;
    constrainedRange.max += lowerOffset;

    var higherOffset = constrainedRange.max > boundingRange.max ?
        boundingRange.max - constrainedRange.max : 0;
    constrainedRange.min += higherOffset;
    constrainedRange.max += higherOffset;

    // If the menu cannot fit within the bounding range then ensure that it at
    // least will still be connected to the anchor and sibling.
    if (constrainedRange.max > connectionBoundingRange.max) {
      constrainedRange.min -= constrainedRange.max -
          connectionBoundingRange.max;
    }
    if (constrainedRange.min < connectionBoundingRange.min) {
      constrainedRange.min = connectionBoundingRange.min;
    }

    this._paletteOffset[constrainedDimension] = constrainedRange.min;
    this._paletteOffset[unconstrainedDimension] =
        this._anchorPosition[unconstrainedDimension];

    if (this._anchorEdge === Palette.ANCHOR_EDGES.RIGHT ||
        this._anchorEdge === Palette.ANCHOR_EDGES.BOTTOM) {
      this._paletteOffset[unconstrainedDimension] -=
          this._sizingCache.paletteDimensions[unconstrainedDimensionProperty] -
          this._sizingCache.borderWidth;
    } else {
      this._paletteOffset[unconstrainedDimension] -=
          this._sizingCache.borderWidth;
    }
  };


  // visible sets the palette to be visible. Elements with the class
  // .dk-palette-no-transition will not have a transition animation applied to
  // go with the palette disappear/appear transition.
  //
  // Arguments
  Palette.prototype.visible = function (isVisible) {
    this._domCache.palette.show();
    if (isVisible) {
      if (this._isVisible) return;
      this._updateDOM();
      this._isVisible = true;
    } else {
      if (!this._isVisible) return;
      this._hideDOM();
      this._isVisible = false;
    }
    this._visibleStateHandlers._callHandlers(isVisible);
  };


  return Palette;
});
