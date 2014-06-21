require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery.min'
  }
});


require(['jquery', 'ui/palette', 'ui/button'], function($, Palette, Button) {
	$(function () {
    var testPalette = null;

    var regularButton = Button.create('#test-button');
    regularButton.addClickHandler(function () {
      console.log('Clicked.');
    });

    var toggleButton = Button.create('#test-toggle');
    toggleButton.addClickHandler(function (toggleState) {
      if (toggleState) console.log('Toggle active.');
      else console.log('Toggle disabled.');
      testPalette.visible(toggleState);
    });

    $('.dk-button').width(100).height(50);
    $('.dk-toggleable-button').width(100).height(50);

		testPalette = new Palette({
			domID: '#test-toggle',
			dimensions: { width: 200, height: 100 },
			anchorEdge: Palette.ANCHOR_EDGES.BOTTOM,
			isVisible: false,
			anchorEdgeBounds: { min: 0, max: Infinity }
		});
	});
});
