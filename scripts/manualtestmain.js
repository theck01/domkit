require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery.min'
  }
});


require(['jquery', 'palette', 'button'], function($, Palette, Buttons) {
	$(function () {
		window.testPalette = new Palette({
			domID: '#test-palette',
			dimensions: { width: 200, height: 100 },
			anchorPosition: { x: 300, y: 300 },
			anchorEdge: Palette.ANCHOR_EDGES.LEFT,
			isVisible: true,
			anchorEdgeBounds: { min: 260, max: Infinity }
		});

    $('.dk-button').width(100).height(50);
    $('.dk-toggleable-button').width(100).height(50);
	});
});
