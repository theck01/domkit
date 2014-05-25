require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery.min'
  }
});


require(['palette'], function(Palette) {
  window.testPalette = new Palette({
    domID: '#test-palette',
    dimensions: { width: 200, height: 100 },
    anchorPosition: { x: 300, y: 300 },
    anchorEdge: Palette.ANCHOR_EDGES.LEFT,
    isVisible: true
  });
});
