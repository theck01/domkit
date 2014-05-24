define(['jquery'], function ($) {

  
  // Palette objects are rectangular menus with rounded corners that are
  // anchored to a location on the page by a triangular point.
  //
  // Arguments:
  //   params: Object with the following key and value pairs.
  //     domID: CSS DOM ID of the empty div to convert into a palette.
  //     dimensions: An object with 'width' and 'height' fields. The dimensions
  //         of the area that the palette will occupy.
  //     anchorPosition: An object with 'x' and 'y' fields. The pixel location
  //         where the palette should be anchored.
  //     anchorEdge: One of Palette.ANCHOR_EDGES
  //     isVisible: Whether the palette should be visualized when created.
  //     anchorEdgeBounds: Optional, an object with 'min' and 'max' fields.
  //         The space in which the anchor edge can exist, must be larger than
  //         the dimensions width or height (dependent upon which edge the
  //         anchor is attached to).
  var Palette = function (params) {
    this._anchorBorderOffset = { x: 0, y: 0 };
    this._anchorEdge = params.anchorEdge;
    this._anchorEdgeBounds = params.anchorEdgeBounds || {
      min: -Infinity, max: Infinity
    };
    this._anchorOffset = { x: 0, y: 0 };
    this._anchorPosition = params.anchorPosition;
    this._constrainedDimension =
        this._anchorEdge === Palette.ANCHOR_EDGES.TOP ||
        this._anchorEdge === Palette.ANCHOR_EDGES.BOTTOM ? 'x': 'y';
    this._domID = params.domID;
    this._dimensions = params.dimensions;
    this._isVisible = params.isVisible;
    this._domCache = {
      palette: null,
      paletteAnchor: null,
      paletteAnchorBorder: null,
      paletteMenuContainer: null,
    };
    this._menuContainerOffset = { x: 0, y: 0 };
    this._sizingCache = {
      borderRadius: null,
      anchorHeight: null,
      anchorBorderHeight: null
    };
    
    this._initializeDOM();
    this._initializeSizings();
    this._updateMenuContainerOffset();
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

  // bound updates the range to which the palette is restricted.
  //
  // Arguments:
  //   boundingBox: Optional, an object with 'xmin', 'xmax', 'ymin', and
  //                'ymax' fields. The area in which the palette can
  //                exist. Must be greater than the dimesions of the palette.
  Palette.prototype.bound = function (boundingBox) {

  };


  // getMenuDiv returns the jQuery object for the palette div that contains all
  // elements in the palette menu.
  Palette.prototype.getMenuContainerElement = function () {
    return this._domCache.paletteMenuContainer;
  };


  // _initializeDOM clears any children of the palette div and adds palette
  // specific DOM children.
  Palette.prototype._initializeDOM = function () {
    this._domCache.palette = $(this._domID);
    this._domCache.palette.empty();
    this._domCache.palette.addClass('palette');

    this._domCache.paletteAnchor = $('<div/>', {
      'class': 'palette-anchor-' + this._anchorEdge,
    });
    this._domCache.palette.append(
        this._domCache.paletteAnchor);

    this._domCache.paletteAnchorBorder = $('<div/>', {
      'class': 'palette-anchor-border-' + this._anchorEdge,
    });
    this._domCache.palette.append(
        this._domCache.paletteAnchorBorder);

    this._domCache.paletteMenuContainer = $('<div/>', {
      'class': 'palette-menu-container',
    });
    this._domCache.palette.append(
        this._domCache.paletteMenuContainer);
  };


  // _initializeSizings sets the values for the sizings of palette parameters,
  // pulled from the css properties set on the elements making up the palette.
  Palette.prototype._initializeSizings = function () {
    var borderWidthProperty =
        'border-' + Palette._OPPOSITE_ANCHOR_EDGES[this._anchorEdge] + '-width';

    this._sizingCache.borderRadius = parseInt(
        this._domCache.paletteMenuContainer.css('border-radius'), 10);
    this._sizingCache.anchorHeight = parseInt(
        this._domCache.paletteAnchor.css(borderWidthProperty), 10);
    this._sizingCache.anchorBorderHeight = parseInt(
        this._domCache.paletteAnchorBorder.css(borderWidthProperty), 10);
  };


  // _updateAnchorOffsets updates the offset for the palette anchor and palette
  // anchor children.
  Palette.prototype._updateAnchorOffsets = function () {
    var borderHeight =
        this._sizingCache.anchorBorderHeight - this._sizingCache.anchorHeight;
    var halfAnchorHeight = Math.floor(this._sizingCache.anchorHeight / 2);
    var halfAnchorBorderHeight =
        Math.floor(this._sizingCache.anchorBorderHeight / 2);

    switch (this._anchorEdge) {
      case Palette.ANCHOR_EDGES.TOP:
        this._anchorOffset.x = this._anchorPosition.x - halfAnchorHeight;
        this._anchorOffset.y = this._anchorPosition.y + borderHeight;
        this._anchorBorderOffset.x =
            this._anchorPosition.x - halfAnchorBorderHeight;
        this._anchorBorderOffset.y = 0;
        break;

      case Palette.ANCHOR_EDGES.LEFT:
        this._anchorOffset.x = this._anchorPosition.x + borderHeight;
        this._anchorOffset.y = this._anchorPosition.y - halfAnchorHeight;
        this._anchorBorderOffset.x = 0;
        this._anchorBorderOffset.y = 
            this._anchorPosition.y - halfAnchorBorderHeight;
        break;

      case Palette.ANCHOR_EDGES.RIGHT:
        this._anchorOffset.x =
            this._anchorPosition.x - this._sizingCache.anchorBorderHeight;
        this._anchorOffset.y = this._anchorPosition.y - halfAnchorHeight;
        this._anchorBorderOffset.x = this._anchorOffset.x;
        this._anchorBorderOffset.y = 
            this._anchorPosition.y - halfAnchorBorderHeight;
        break;

      case Palette.ANCHOR_EDGES.BOTTOM:
        this._anchorOffset.x = this._anchorPosition.x - halfAnchorHeight;
        this._anchorOffset.y =
            this._anchorPosition.y - this._sizingCache.anchorBorderHeight;
        this._anchorBorderOffset.x =
            this._anchorPosition.x - halfAnchorBorderHeight;
        this._anchorBorderOffset.y = this._anchorOffset.y;
        break;

      default:
        throw Error('Cannot update offset for anchors on unknown edge.');
    }
  };


  // _updateDOM applies the current palette state to the DOM elements that
  // make up the palette.
  Palette.prototype._updateDOM = function () {

  };

  // _updateMenuContainerOffset updates the offset for the menu container
  // child of the palette, attempting to keep the container within the
  // constrained edge bounds. Throws an error if constraints cannot be obeyed.
  Palette.prototype._updateMenuContainerOffset = function () {
    var unconstrainedDimension =
        this._constrainedDimension === 'x' ? 'y' : 'x';
    var constrainedDimensionProperty =
        this._constrainedDimension === 'x' ? 'width' : 'height';
    var unconstrainedDimensionProperty =
        this._constrainedDimension === 'x' ? 'height' : 'width';

    var constraints = {
      min: this._anchorEdgeBounds.min + this._sizingCache.borderRadius +
          this._sizingCache.anchorBorderHeight,
      max: this._anchorEdgeBounds.max - this._sizingCache.borderRadius -
          this._sizingCache.anchorBorderHeight
    };

    var constrainedRange = {
      min: this._anchorPosition[this._constrainedDimension] -
          Math.floor(this._dimensions[constrainedDimensionProperty] / 2),
      max: this._anchorPosition[this._constrainedDimension] +
          Math.ceil(this._dimensions[constrainedDimensionProperty] / 2)
    };

    var lowerOffset = constrainedRange.min < constraints.min ?
        constraints.min - constrainedRange.max : 0;
    constrainedRange.min += lowerOffset;
    constrainedRange.max += lowerOffset;

    var higherOffset = constrainedRange.max > constraints.max ?
        constraints.max - constrainedRange.min : 0;
    constrainedRange.min += higherOffset;
    constrainedRange.max += higherOffset;

    if (constrainedRange.min < constraints.min ||
        constrainedRange.max > constraints.max) {
      throw Error('Cannot find location for palette in constrained dimension.');
    }

    this._menuContainerOffset[this._constrainedDimension] =
        constrainedRange.min;
    this._menuContainerOffset[unconstrainedDimension] =
        this._anchorPosition[unconstrainedDimension];

    if (this._anchorEdge === Palette.ANCHOR_EDGES.LEFT ||
        this._anchorEdge === Palette.ANCHOR_EDGES.TOP) {
      this._menuContainerOffset += this._sizingCache.anchorBorderHeight;
    }
  };


  // visible sets the palette to be visible, with optional animation duration
  // to expand or shink the palette from the anchor point.
  //
  // Arguments
  Palette.prototype.visible = function (isVisible, opt_animationDuration) {

  };


  return Palette;
});
