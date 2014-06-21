require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery.min'
  }
});


require(['jquery', 'ui/palette', 'ui/button'], function($, Palette, Button) {
	$(function () {
		window.testPalette = new Palette({
			domID: '#test-palette',
			dimensions: { width: 200, height: 100 },
			anchorPosition: { x: 300, y: 300 },
			anchorEdge: Palette.ANCHOR_EDGES.LEFT,
			isVisible: true,
			anchorEdgeBounds: { min: 260, max: Infinity }
		});

    window.Button = Button;

    var regularButton = Button.create('#test-button');
    regularButton.addClickHandler(function () {
      console.log('Clicked.');
    });

    var toggleButton = Button.create('#test-toggle');
    toggleButton.addClickHandler(function (toggleState) {
      if (toggleState) console.log('Toggle active.');
      else console.log('Toggle disabled.');
    });

    $('.dk-button').width(100).height(50);
    $('.dk-toggleable-button').width(100).height(50);
	});
});
