define(['jquery'], function ($) {

  
  // Palette objects are rectangular menus with rounded corners that are
  // anchored to a location on the page by a triangular point.
  //
  // Arguments:
  //   params: Object with the following key and value pairs.
  //     domID: CSS DOM ID of the empty div to convert into a palette.
  //     dimensions: An object with 'width' and 'height' fields. The dimensions
  //                 of the area that the palette will occupy.
  //     anchorPosition: An object with 'x' and 'y' fields. The pixel location
  //                     where the palette should be anchored.
  //     anchorEdge: One of Palette.ANCHOR_EDGES
  //     isVisible: Whether the palette should be visualized when created.
  //     opt_boundingBox: Optional, an object with 'xmin', 'xmax', 'ymin', and
  //                      'ymax' fields. The area in which the palette can
  //                      exist. Must be greater than the dimesions. If not
  //                      specified then defaults to no restrictions.
  var Palette = function (params) {
    this._anchorEdge = params.anchorEdge;
    this._anchorOffset = null;
    this._anchorPosition = params.anchorPosition;
    this._boundingBox = params.boundingBox || {
      xmin: -Infinity,
      xmax: Infinity,
      ymin: -Infinity,
      ymax: Infinity
    };
    this._domID = params.domID;
    this._dimensions = params.dimensions;
    this._isVisible = params.isVisible;
    this._domCache = {
      palette: null,
      paletteAnchor: null,
      paletteAnchorBorder: null,
      paletteMenuContainer: null,
    };
    this._sizingCache = {
      borderRadius: null,
      anchorHeight: null,
      anchorBorderHeight: null
    };
    
    this._initializeDOM();
    this._initializeSizings();
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


  // _updateDOM applies the current palette state to the DOM elements that
  // make up the palette.
  Palette.prototype._updateDOM = function () {

  };


  // visible sets the palette to be visible, with optional animation duration
  // to expand or shink the palette from the anchor point.
  //
  // Arguments
  Palette.prototype.visible = function (isVisible, opt_animationDuration) {

  };


  return Palette;
});
