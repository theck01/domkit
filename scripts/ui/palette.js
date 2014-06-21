define(['jquery'], function ($) {
  // Palette objects are rectangular menus with rounded corners that are
  // anchored to a location on the page by a triangular point.
  //
  // Arguments:
  //   params: Object with the following key and value pairs.
  //     domID: CSS DOM ID of the empty div to convert into a palette.
  //     dimensions: An object with 'width' and 'height' fields. The dimensions
  //         of the area that the menu of the palette will occupy.
  //     anchorPosition: An object with 'x' and 'y' fields. The pixel location
  //         where the palette should be anchored.
  //     anchorEdge: One of Palette.ANCHOR_EDGES
  //     isVisible: Whether the palette should be visualized when created.
  //     anchorEdgeBounds: Optional, an object with 'min' and 'max' fields.
  //         The space in which the anchor edge can exist, must be larger than
  //         that edge of the palette or an error will be thrown.
  var Palette = function (params) {
    this._anchorBorderOffset = { x: 0, y: 0 };
    this._anchorEdge = params.anchorEdge;
    this._anchorEdgeBounds = params.anchorEdgeBounds || {
      min: -Infinity, max: Infinity
    };
    this._anchorOffset = { x: 0, y: 0 };
    this._anchorPosition = params.anchorPosition;
    this._domID = params.domID;
    this._dimensions = params.dimensions;
    this._isVisible = params.isVisible;
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
      anchorBorderHeight: null,
      borderWidth: null,
      menuContainerPadding: null,
      paletteDimensions: null
    };
    
    this._initializeDOM();
    this._initializeSizings();
    this._updateAnchorOffsets();
    this._updatePaletteOffset();
    this._updateDOM();
    this.visible(this._isVisible);
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
  Palette._OPPOSITE_ANCHOR_EDGES = {};
  Palette._OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.TOP] =
      Palette.ANCHOR_EDGES.BOTTOM;
  Palette._OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.LEFT] =
      Palette.ANCHOR_EDGES.RIGHT;
  Palette._OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.RIGHT] =
      Palette.ANCHOR_EDGES.LEFT;
  Palette._OPPOSITE_ANCHOR_EDGES[Palette.ANCHOR_EDGES.BOTTOM] =
      Palette.ANCHOR_EDGES.TOP;

  // bound updates the range to which the palette's anchor edge is restricted.
  //
  // Arguments:
  //   boundingRange: Optional, an object with 'min' and 'max'
  Palette.prototype.bound = function (boundingBox) {

  };


  // getMenuDiv returns the jQuery object for the palette div that contains all
  // elements in the palette menu.
  Palette.prototype.getMenuElement = function () {
    return this._domCache.paletteMenu;
  };


  // _hideDOM collapses palette to the anchor origin point, hiding the contents
  // from view
  Palette.prototype._hideDOM = function () {
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

    this._domCache.palette.css(hiddenPaletteProperties);
    this._domCache.paletteAnchor.css(hiddenComponentProperties);
    this._domCache.paletteAnchorBorder.css(hiddenComponentProperties);
    this._domCache.paletteMenuContainer.css(hiddenComponentProperties);
    this._domCache.paletteMenu.css(hiddenComponentProperties);
  };


  // _initializeDOM clears any children of the palette div and adds palette
  // specific DOM children.
  Palette.prototype._initializeDOM = function () {
    this._domCache.palette = $(this._domID);
    this._domCache.palette.empty();
    this._domCache.palette.addClass('dk-palette');

    this._domCache.paletteMenuContainer = $('<div/>', {
      'class': 'dk-palette-menu-container',
    });
    this._domCache.palette.append(this._domCache.paletteMenuContainer);

    this._domCache.paletteMenu = $('<div/>', {
      'class': 'dk-palette-menu'
    });
    this._domCache.paletteMenuContainer.append(this._domCache.paletteMenu);

    this._domCache.paletteAnchorBorder = $('<div/>', {
      'class': 'dk-palette-anchor-border-' + this._anchorEdge,
    });
    this._domCache.palette.append(this._domCache.paletteAnchorBorder);

    this._domCache.paletteAnchor = $('<div/>', {
      'class': 'dk-palette-anchor-' + this._anchorEdge,
    });
    this._domCache.palette.append(this._domCache.paletteAnchor);
  };


  // _initializeSizings sets the values for the sizings of palette parameters,
  // pulled from the css properties set on the elements making up the palette.
  Palette.prototype._initializeSizings = function () {
    var borderWidthProperty =
        'border-' + Palette._OPPOSITE_ANCHOR_EDGES[this._anchorEdge] + '-width';

    this._sizingCache.anchorHeight = parseInt(
        this._domCache.paletteAnchor.css(borderWidthProperty), 10);
    this._sizingCache.anchorBorderHeight = parseInt(
        this._domCache.paletteAnchorBorder.css(borderWidthProperty), 10);
    this._sizingCache.borderWidth = parseInt(
        this._domCache.paletteMenuContainer.css('border-width'), 10);
    this._sizingCache.menuContainerPadding = parseInt(
        this._domCache.paletteMenuContainer.css('padding'), 10);

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
        this._sizingCache.anchorBorderHeight;
  };


  // _updateAnchorOffsets updates the offset for the palette anchor and palette
  // anchor children.
  Palette.prototype._updateAnchorOffsets = function () {
    var heightDiff =
        this._sizingCache.anchorBorderHeight - this._sizingCache.anchorHeight;
    var halfAnchorHeight = Math.floor(this._sizingCache.anchorHeight / 2);
    var halfAnchorBorderHeight =
        Math.floor(this._sizingCache.anchorBorderHeight / 2);

    switch (this._anchorEdge) {
      case Palette.ANCHOR_EDGES.TOP:
        this._anchorOffset.x = this._anchorPosition.x - halfAnchorHeight;
        this._anchorOffset.y = this._anchorPosition.y + heightDiff;
        this._anchorBorderOffset.x =
            this._anchorPosition.x - halfAnchorBorderHeight;
        this._anchorBorderOffset.y = this._anchorPosition.y;
        break;

      case Palette.ANCHOR_EDGES.LEFT:
        this._anchorOffset.x = this._anchorPosition.x + heightDiff;
        this._anchorOffset.y = this._anchorPosition.y - halfAnchorHeight;
        this._anchorBorderOffset.x = this._anchorPosition.x;
        this._anchorBorderOffset.y = 
            this._anchorPosition.y - halfAnchorBorderHeight;
        break;

      case Palette.ANCHOR_EDGES.RIGHT:
        this._anchorOffset.x =
            this._anchorPosition.x - this._sizingCache.anchorBorderHeight;
        this._anchorOffset.y = this._anchorPosition.y - halfAnchorHeight;
        this._anchorBorderOffset.x = 
            this._anchorPosition.x - this._sizingCache.anchorBorderHeight;
        this._anchorBorderOffset.y = 
            this._anchorPosition.y - halfAnchorBorderHeight;
        break;

      case Palette.ANCHOR_EDGES.BOTTOM:
        this._anchorOffset.x = this._anchorPosition.x - halfAnchorHeight;
        this._anchorOffset.y =
            this._anchorPosition.y - this._sizingCache.anchorBorderHeight;
        this._anchorBorderOffset.x =
            this._anchorPosition.x - halfAnchorBorderHeight;
        this._anchorBorderOffset.y =
            this._anchorPosition.y - this._sizingCache.anchorBorderHeight;
        break;

      default:
        throw Error('Cannot update offset for anchors on unknown edge.');
    }
  };


  // _updateDOM applies the current palette state to the DOM elements that
  // make up the palette.
  Palette.prototype._updateDOM = function () {
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
        menuContainerOffset.top += this._sizingCache.anchorBorderHeight;
    } else if (this._anchorEdge === Palette.ANCHOR_EDGES.LEFT) {
        menuContainerOffset.left += this._sizingCache.anchorBorderHeight;
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
  };

  // _updatePaletteOffset updates the offset for the menu container
  // child of the palette, attempting to keep the container within the
  // constrained edge bounds. Throws an error if constraints cannot be obeyed.
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
    var constrainedRange = {
      min: this._anchorPosition[constrainedDimension] -
          Math.floor(paletteDimensions[constrainedDimensionProperty] / 2),
      max: this._anchorPosition[constrainedDimension] +
          Math.ceil(paletteDimensions[constrainedDimensionProperty] / 2)
    };

    var lowerOffset = constrainedRange.min < this._anchorEdgeBounds.min ?
        this._anchorEdgeBounds.min - constrainedRange.min : 0;
    constrainedRange.min += lowerOffset;
    constrainedRange.max += lowerOffset;

    var higherOffset = constrainedRange.max > this._anchorEdgeBounds.max ?
        this._anchorEdgeBounds.max - constrainedRange.max : 0;
    constrainedRange.min += higherOffset;
    constrainedRange.max += higherOffset;

    if (constrainedRange.min < this._anchorEdgeBounds.min ||
        constrainedRange.max > this._anchorEdgeBounds.max) {
      throw Error('Cannot find location for palette in constrained dimension.');
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


  // visible sets the palette to be visible, with optional animation duration
  // to expand or shink the palette from the anchor point.
  //
  // Arguments
  Palette.prototype.visible = function (isVisible) {
    if (isVisible) {
      if (this._isVisible) return;
      this._updateDOM();
      this._isVisible = true;
    } else {
      if (!this._isVisible) return;
      this._hideDOM();
      this._isVisible = false;
    }
  };


  return Palette;
});
