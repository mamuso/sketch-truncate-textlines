var onRun = function(context) {
  var doc = context.document;
  var selection = context.selection;

  // Ask for some info
  var options = ["Truncate words", "Truncate characters"];
  var choices = createDialog("How many lines do you need?", options, 0);
  var lines = choices[1];
  var go = choices[0] == 1000 ? true : false;
  var truncateMode = choices[2];

  if (lines && go) {
    selection.forEach(function(layer) {
      if (isLayerText(layer)) {
        var text = String(layer.stringValue());
        var ellipsis = text;
        var popped;

        // Creates a duplicated text field to use it as a playground
        var layerCopy = layer.duplicate();
        layerCopy.setStringValue("-");
        refreshTextLayer(layerCopy);

        // Defines the height of the line
        var lineHeight = layerCopy.frame().height();

        // Get ready to iterate
        layerCopy.setStringValue(text);
        refreshTextLayer(layerCopy);
        actualHeight = layerCopy.frame().height();

        while (actualHeight > lineHeight * lines) {
          // Shrinking the text
          if (truncateMode > 0) {
            text = text.slice(0, -1);
          } else {
            text = text.split(" ");
            popped = text.pop();
            text = text.join(" ");
            popped = popped.split("\n");
            if (popped.length > 1) {
              text = text + " " + popped[0];
            }
          }

          if (popped && popped.length > 1) {
            ellipsis = text;
          } else {
            // Remove unwanted characters
            if (text.slice(-1).match(/[\,\.\;\:\-\n\r]/)) {
              text = text.slice(0, -1);
            }
            ellipsis = text + "…";
          }

          //set trimmed text and re-evaluate height
          layerCopy.setStringValue(ellipsis);
          refreshTextLayer(layerCopy);
          actualHeight = layerCopy.frame().height();
        }

        if (ellipsis.length > 1) {
          layer.setStringValue(ellipsis);
        }

        layerCopy.removeFromParent();
      }
    });
  }

  // Checks if the layer is a text layer.
  function isLayerText(layer) {
    return layer.isKindOfClass(MSTextLayer.class());
  }

  // Refreshes text layer boundaries after setting text.
  function refreshTextLayer(layer) {
    var width = layer.frame().width();
    layer.textBehaviour = 0;
    layer.adjustFrameToFit();
    layer.textBehaviour = 1;
    layer.frame().width = width;
    layer.adjustFrameToFit();
    if (MSApplicationMetadata.metadata().appVersion > 45) {
      layer.select_byExtendingSelection(true, false);
    } else {
      layer.select_byExpandingSelection(true, false);
    }
    layer.setIsEditingText(true);
    layer.setIsEditingText(false);
    if (MSApplicationMetadata.metadata().appVersion > 45) {
      layer.select_byExtendingSelection(false, false);
    } else {
      layer.select_byExpandingSelection(false, false);
    }
  }

  function createDialog(msg, items, selectedItemIndex) {
    selectedItemIndex = selectedItemIndex || 0;

    var accessoryInput = NSView.alloc().initWithFrame(
      NSMakeRect(0, 0, 300, 25)
    );
    var input = NSTextField.alloc().initWithFrame(NSMakeRect(0, 0, 300, 25));
    input.editable = true;
    input.stringValue = "2";
    accessoryInput.addSubview(input);

    var accessoryList = NSComboBox.alloc().initWithFrame(
      NSMakeRect(0, 0, 160, 25)
    );
    accessoryList.addItemsWithObjectValues(items);
    accessoryList.selectItemAtIndex(selectedItemIndex);

    var alert = COSAlertWindow.alloc().init();
    alert.setMessageText(msg);
    alert.addButtonWithTitle("OK");
    alert.addButtonWithTitle("Cancel");
    alert.addAccessoryView(accessoryInput);
    alert.addAccessoryView(accessoryList);

    var responseCode = alert.runModal();

    return [
      responseCode,
      input.stringValue(),
      accessoryList.indexOfSelectedItem()
    ];
  }
};
