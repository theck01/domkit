require.config({
  paths: {
    jquery: '../bower_components/jquery/jquery.min'
  }
});


require(['jquery', 'controllers/radiogroup', 'ui/palette', 'ui/button'],
    function($, RadioGroup, Palette, Button) {
	$(function () {
    var regularButton = Button.create('#test-button');
    regularButton.addClickHandler(function () {
      console.log('Button clicked.');
    });

    var testPalettes = [];
    var radioButtons = [];

    radioButtons[0] = Button.create('#test-radio-0');
    radioButtons[0].addClickHandler(function (toggleState) {
      if (toggleState) console.log('Radio 0 active.');
      else console.log('Radio 0 disabled.');
      testPalettes[0].visible(toggleState);
    });
    radioButtons[1] = Button.create('#test-radio-1');
    radioButtons[1].addClickHandler(function (toggleState) {
      if (toggleState) console.log('Radio 1 active.');
      else console.log('Radio 1 disabled.');
      testPalettes[1].visible(toggleState);
    });
    radioButtons[2] = Button.create('#test-radio-2');
    radioButtons[2].addClickHandler(function (toggleState) {
      if (toggleState) console.log('Radio 2 active.');
      else console.log('Radio 2 disabled.');
      testPalettes[2].visible(toggleState);
    });

    new RadioGroup(radioButtons);

    $('.dk-button').width(100).height(50);
    $('.dk-toggleable-button').width(100).height(50);

		testPalettes[0] = new Palette({
			domID: '#test-radio-0',
			dimensions: { width: 200, height: 100 },
			anchorEdge: Palette.ANCHOR_EDGES.BOTTOM,
			isVisible: false,
			anchorEdgeBounds: { min: 0, max: Infinity }
		});
		testPalettes[1] = new Palette({
			domID: '#test-radio-1',
			dimensions: { width: 200, height: 100 },
			anchorEdge: Palette.ANCHOR_EDGES.BOTTOM,
			isVisible: false,
			anchorEdgeBounds: { min: 0, max: Infinity }
		});
		testPalettes[2] = new Palette({
			domID: '#test-radio-2',
			dimensions: { width: 200, height: 100 },
			anchorEdge: Palette.ANCHOR_EDGES.BOTTOM,
			isVisible: false,
			anchorEdgeBounds: { min: 0, max: Infinity }
		});
	});
});
