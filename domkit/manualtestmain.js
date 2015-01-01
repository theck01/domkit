require.config({
  baseUrl: '.',
  paths: {
    jquery: 'bower_components/jquery/jquery.min'
  }
});


require(
    ['jquery', 'domkit/controllers/radiogroup', 'domkit/ui/palette',
    'domkit/ui/button', 'domkit/ui/tooltip', 'domkit/ui/textinput'],
    function($, RadioGroup, Palette, Button, Tooltip, TextInput) {
  $(function () {
    Button.createAll();
    Tooltip.createAll(1000);
    TextInput.createAll();

    var regularButton = Button.create('#test-button');
    regularButton.disable();

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

    window.radioGroup = new RadioGroup(radioButtons);

    testPalettes[0] = new Palette({
      sibling: '#test-radio-0',
      menu: $('<div/>', { 'class': 'placeholder' }),
      anchorEdge: Palette.ANCHOR_EDGES.BOTTOM,
      isVisible: false,
      anchorEdgeBounds: { min: 0, max: Infinity }
    });
    testPalettes[0].addVisibleStateHandler(function (isVisible) {
      if (isVisible) console.log('Palette 0 is visible.');
      else console.log('Palette 0 is not visible.');
    });
    testPalettes[0].addDelayedVisibleStateHandler(function (isVisible) {
      if (isVisible) console.log('Palette 0 is now visible.');
      else console.log('Palette 0 is now not visible.');
    });

    testPalettes[1] = new Palette({
      sibling: '#test-radio-1',
      menu: '#test-menu',
      anchorEdge: Palette.ANCHOR_EDGES.BOTTOM,
      isVisible: false,
      anchorEdgeBounds: { min: 0, max: Infinity }
    });
    testPalettes[1].addVisibleStateHandler(function (isVisible) {
      if (isVisible) console.log('Palette 1 is visible.');
      else console.log('Palette 1 is not visible.');
    });
    testPalettes[1].addDelayedVisibleStateHandler(function (isVisible) {
      if (isVisible) console.log('Palette 1 is now visible.');
      else console.log('Palette 1 is now not visible.');
    });

    testPalettes[2] = new Palette({
      sibling: '#test-radio-2',
      menu: $('<div/>', { 'class': 'placeholder' }),
      anchorEdge: Palette.ANCHOR_EDGES.BOTTOM,
      isVisible: false,
      anchorEdgeBounds: { min: 0, max: Infinity }
    });
    testPalettes[2].addVisibleStateHandler(function (isVisible) {
      if (isVisible) console.log('Palette 2 is visible.');
      else console.log('Palette 2 is not visible.');
    });
    testPalettes[2].addDelayedVisibleStateHandler(function (isVisible) {
      if (isVisible) console.log('Palette 2 is now visible.');
      else console.log('Palette 2 is now not visible.');
    });

    window.testButton = Button.create('#test-button');
    window.paletteOrientationTest = new Palette({
      sibling: '#test-div',
      menu: $('<div/>', { 'class': 'placeholder' }),
      anchorEdge: Palette.ANCHOR_EDGES.RIGHT,
      isVisible: true,
      anchorEdgeBounds: { min: 0, max: 420 }
    });

    var testMenuButtons = [];
    $('#test-menu').children('button').each(function () {
      testMenuButtons.push(Button.create($(this)));
    });
    var forcedActiveRadio = new RadioGroup(testMenuButtons, 0, true);
  });
});
