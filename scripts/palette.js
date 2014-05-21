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
    this._domElementCache = {
      palette: null,
      paletteAnchor: null,
      paletteAnchorBorder: null,
      paletteContainer: null,
      paletteMenuContainer: null,
      paletteMenu: null
    };
    
    this._initializeDOM();
    this._updateDOM();
    this.visible(this._isVisible);
  };


  // Altitude of the anchor triangle in pixels.
  Palette._ANCHOR_ALTITUDE = 10;

  // ANCHOR_EDGES enumeration of the edge which can be anchored to 
  Palette.ANCHOR_EDGES = {
    TOP: 'anchor-edge-top',
    BOTTOM: 'anchor-edge-bottom',
    LEFT: 'anchor-edge-left',
    RIGHT: 'anchor-edge-right'
  };

  // Padding between the usable area and the boundry of the visible palette in
  // pixels.
  Palette._MENU_PADDING = 10;


  // bound updates the range to which the palette is restricted.
  //
  // Arguments:
  //   boundingBox: Optional, an object with 'xmin', 'xmax', 'ymin', and
  //                'ymax' fields. The area in which the palette can
  //                exist. Must be greater than the dimesions plus
  //                2 * Palette.USABLE_AREA_PADDING.
  Palette.prototype.bound = function (boundingBox) {

  };


  // getMenuDiv returns the jQuery object for the palette div that contains all
  // elements in the palette menu.
  Palette.prototype.getMenuDiv = function () {
    return this._domElementCache.paletteMenu;
  };


  // initializeDOM clears any children of the palette div and adds palette
  // specific DOM children.
  Palette.prototype._initializeDOM = function () {
    this._domElementCache.palette = $(this._domID);
    this._domElementCache.palette.empty();

    this._domElementCache.paletteContainer = $('<div/>', {
      'class': 'palette-container',
    });
    this._domElementCache.palette.append(
        this._domElementCache.paletteContainer);

    this._domElementCache.paletteAnchor = $('<div/>', {
      'class': 'palette-anchor',
    });
    this._domElementCache.paletteContainer.append(
        this._domElementCache.paletteAnchor);

    this._domElementCache.paletteAnchorBorder = $('<div/>', {
      'class': 'palette-anchor-border',
    });
    this._domElementCache.paletteContainer.append(
        this._domElementCache.paletteAnchorBorder);

    this._domElementCache.paletteMenuContainer = $('<div/>', {
      'class': 'palette-menu-container',
    });
    this._domElementCache.paletteContainer.append(
        this._domElementCache.paletteMenuContainer);

    this._domElementCache.paletteMenu = $('<div/>', {
      'class': 'palette-menu',
    });
    this._domElementCache.paletteMenuContainer.append(
        this._domElementCache.paletteMenu);
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
