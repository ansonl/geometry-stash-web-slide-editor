var FileDataStruct;
var masterFile;

var elementPropertyArray = new Array();

var glob;

var uploadedFilename;

var chainIncrement = 0;

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function makeElementProperties() {
	var Line = makeStruct('shapeType originx originy thickness endx endy strokeColor');
	var Rect = makeStruct('shapeType originx originy thickness width height strokeColor fillColor');
	var Ellipse = makeStruct('shapeType originx originy thickness width height strokeColor fillColor');
	var Circle = makeStruct('shapeType originx originy thickness radius strokeColor fillColor');
	var Arc = makeStruct('shapeType originx originy thickness radius strokeColor fillColor');
	var Curve = makeStruct('shapeType originx originy thickness endx endy controlPoint1x controlPoint1y controlPoint2x controlPoint2y strokeColor fillColor');
	var Textfield = makeStruct('shapeType originx originy width height fontHeight strokeColor fillColor bgcolor interactive text');

	elementPropertyArray['line'] = Line;
	elementPropertyArray['rectangle'] = Rect;
	elementPropertyArray['ellipse'] = Ellipse;
	elementPropertyArray['circle'] = Circle;
	elementPropertyArray['arc'] = Arc;
	elementPropertyArray['curve'] = Curve;
	elementPropertyArray['text'] = Textfield;
}

 $(document).ready(function() {
 	//setup ui
 	$('#downloadButton').prop('disabled', true);
 	$('#createNewElementButton').prop('disabled', true);

 	setupCanvasStyleAndAttr();

 	$("#moveElementAmountInput").on('input', function() {
 		if ($("#moveElementAmountInput").val() > 0)
 			$(".moveElementButton").prop('disabled', false);
 		else
 			$(".moveElementButton").prop('disabled', true);
 	});

 	$('#inputTextArea').height((window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - $('#previewCanvas').height() - parseInt($('#controlButtonArea').css('height')));

 	FileDataStruct = makeStruct('parsed');

 	makeElementProperties();

 	//use jquery textarea autogrow plugin http://www.technoreply.com/autogrow-textarea-plugin-3-0/
 	//$('#inputTextArea').autoGrow();
 	$("#inputTextArea").on('input', function() {inputChanged()});
 	$("#inputTextArea").on('click', function() {
 		
 	});
 	/*
 	$("#previewCanvas").on('click', function() {
 		
 	});
*/

 	masterFile = new FileDataStruct();
	$('#readInButton').click(function() {
		masterFile.parsed = JSON.parse($("#inputTextArea").val());
		updateToUpdatedFileStruct();
	});
	
	//setup download button handler
	$('#downloadButton').click(function() {
		var fileContent = JSON.stringify(masterFile.parsed, null, 2);
		/*
		if (uploadedFilename)
			downloadText(uploadedFilename, fileContent);
		else*/ if (masterFile.parsed['title'])
			downloadText(masterFile.parsed['title'] + '.json', fileContent);
		elsef
			downloadText('untitled.json', fileContent);
		
	});

	//to manually reflect changes in tree view to text view
	//$('#printOutButton').click(function() {printCurrentFileData();});
	$('#createNewElementButton').click(function() {
		var newElementConstructor = elementPropertyArray[$('#newElementTypeDropdown').val()];
		var newElement = new newElementConstructor($('#newElementTypeDropdown').val());
		masterFile.parsed['elements'].push(newElement);

		//update structural view
		convertInput($('#elementListArea'), masterFile.parsed['elements'], false, 0);

		//update text view
		printCurrentFileData();

	});

	$('#fileImportButton').click(function() {		 
		var fileElement = $('#fileInputElement');
	  if ($('#fileInputElement')) {
	    fileElement.click();
	  }
	});

	masterFile.parsed = JSON.parse($("#inputTextArea").val());
	updateToUpdatedFileStruct();

});

//handle upload files
function handleFiles(files) {
	var selectedFile = files[0];
	var reader = new FileReader();

	//start read
	reader.onloadstart = function() {
		$('#fileImportButton').prop('disabled', true);
		$('#fileImportButton').html('<span class="glyphicon glyphicon-transfer" aria-hidden="true"></span> Reading')
	};

	//successful read
	reader.onload = function () {
    $("#inputTextArea").val(reader.result);

		uploadedFilename = (selectedFile['name']);

		try {
        var o = JSON.parse($("#inputTextArea").val());

      	if (masterFile.parsed === null)
      		alert('File may not be a json file. ');
    } catch (e) {
    	console.log(e);
        alert('ERROR PARSING FILE\n\n' + e + '\n\nCurrent data not replaced by the file.');
    }

		inputChanged();
  };

  //end read success and fail
	reader.onloadend = function () {
    $("#inputTextArea").val(reader.result);
    $('#fileImportButton').prop('disabled', false);
    $('#fileImportButton').html('<span class="glyphicon glyphicon-import" aria-hidden="true"></span> Import Local File')
  };

	reader.readAsText(selectedFile);
}

//http://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
function downloadText(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function inputChanged() {
  masterFile.parsed = JSON.parse($("#inputTextArea").val());
  updateToUpdatedFileStruct();
}

function printCurrentFileData() {
	$("#inputTextArea").val(JSON.stringify(masterFile.parsed, null, 2));
}

function updateToUpdatedFileStruct(element) {
	convertInput($('#elementListArea'), masterFile.parsed['elements'], false, 0);
	setBackgroundColor(masterFile.parsed['bgcolor']);
	updatePreviewCanvas(masterFile.parsed['elements'], null, null, null);

	if (masterFile.parsed) {
			$('#createNewElementButton').prop('disabled', false);
			$('#downloadButton').prop('disabled', false);
	}
}

function convertInput(destinationDiv, sourceElementsArray, append, chainParentPosition) {
	var divToAdd = jQuery('<div/>', {
		class: 'elementHolder',
		id: i
	});

	//replace entire contents of destination div?
	if (append != true)
		destinationDiv.html('');
	destinationDiv.append(divToAdd);
	
	var i;
	for (i = 0; i < sourceElementsArray.length; i++) {
		var keys = [];
		for (var key in sourceElementsArray[i]) {
		  if (sourceElementsArray[i].hasOwnProperty(key) && key != 'shapeType') {
		  //if (sourceElementsArray[i].hasOwnProperty(key)) {
		    keys.push(key);
		  }
		}

		var singleElement = jQuery('<div/>', {
			class: 'singleElement',
			id: i,
		});

		var elementTitle = jQuery('<span/>', {
			class: 'propertyTitle',
			text: sourceElementsArray[i]['shapeType']
		});

		var commentSpan = jQuery('<span/>', {
			class: 'commentSpan',
			text: ' - ' + sourceElementsArray[i]['comment']
		});

		elementTitle.append(commentSpan);

		var floatRightDivElement = jQuery('<span/>', {
			class: 'floatRightDivElement'
		});

		var moveArrowArea = jQuery('<span/>', {
			class: 'moveElementButtonArea',
			text: 'Move '
		});

		moveArrowArea.click(function(e) {
			$("#moveElementAmountInput").focus()
		});

		var moveButtonArray= [];

		var moveElementLeftButton = jQuery('<button/>', {
			class: 'btn btn-xs moveElementButton moveLeftButton'
		});
		moveElementLeftButton.html('<span class="glyphicon glyphicon-triangle-left" aria-hidden="true"></span>');

		var moveElementUpButton = jQuery('<button/>', {
			class: 'btn btn-xs moveElementButton moveUpButton'
		});
		moveElementUpButton.html('<span class="glyphicon glyphicon-triangle-top" aria-hidden="true"></span>');

		var moveElementDownButton = jQuery('<button/>', {
			class: 'btn btn-xs moveElementButton moveDownButton'
		});
		moveElementDownButton.html('<span class="glyphicon glyphicon-triangle-bottom" aria-hidden="true"></span>');

		var moveElementRightButton = jQuery('<button/>', {
			class: 'btn btn-xs moveElementButton moveRightButton'
		});
		moveElementRightButton.html('<span class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>');

		moveButtonArray.push(moveElementLeftButton, moveElementRightButton, moveElementUpButton, moveElementDownButton);

		for (var counter = 0; counter < moveButtonArray.length; counter++) {
			moveButtonArray[counter].click(function(e) {
				e.stopPropagation();
			});
		}

		var disabled;
		if ($("#moveElementAmountInput").val() > 0) {
 			disabled = false;
		} else {
 			disabled = true;
 		}

 		for (var counter = 0; counter < moveButtonArray.length; counter++)
 			moveButtonArray[counter].prop('disabled', disabled);


		//create move element button handler
  	var createMoveButtonHandler =  function(index, element){
      element.click(function(e) {
      	var amount = $('#moveElementAmountInput').val();
      	if (!amount) {
      		console.log('no amount given');
      		amount = 0;
      	}

      	var direction;
      	if (element.hasClass('moveLeftButton'))
      		direction = 'left';
      	else if (element.hasClass('moveUpButton'))
      		direction = 'up';
      	else if (element.hasClass('moveDownButton'))
      		direction = 'down';
      	else if (element.hasClass('moveRightButton'))
      		direction = 'right';
      	else
      		console.log('move element has no supported class', element);

      	moveElement(sourceElementsArray, index, direction, amount);
      });
  	};

  	createMoveButtonHandler(i, moveElementLeftButton);
  	createMoveButtonHandler(i, moveElementUpButton);
  	createMoveButtonHandler(i, moveElementDownButton);
  	createMoveButtonHandler(i, moveElementRightButton);

		var elementDelete = jQuery('<button/>', {
			class: 'btn btn-xs btn-danger keyDelete'
		});
		elementDelete.html('<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>');

		//create delete element handler
  	(function(index, element, containingDivToRemove){
      element.click(function(e) {
      	deleteElement(sourceElementsArray, index);
      	containingDivToRemove.remove();
      });
  	})(i, elementDelete, singleElement);

		var elementHandle = jQuery('<span/>', {
			class: 'elementHandle elementHandleWithParentPosition' + chainParentPosition
		});
		elementHandle.html('<span class="glyphicon glyphicon-menu-hamburger" aria-hidden="true"></span>')

		var allPropertyFields = jQuery('<div/>', {
			class: 'collapse propertyFields',
			id: 'elementPropertyFields' + i + 'WithParentPosition' + chainParentPosition
		});

		var j;
		
		for (j = 0; j < keys.length; j++) {
			var currentKey = keys[j];
			var propertyFieldAndLabel = jQuery('<div/>', {
				class: 'keyValuePropertyRow'
			});
			//for all normal property fields
			if (currentKey != 'elements') {
				var propertyTitle = jQuery('<span/>', {
					class: 'keyLabel',
					text: currentKey
				});



				var floatRightDivProperty = jQuery('<span/>', {
					class: 'floatRightDivProperty'
				});

				var propertyValue = jQuery('<input/>', {
					class: 'valueTextInput',
					type: 'text',
					value: sourceElementsArray[i][currentKey]
				});

				var propertyDelete = jQuery('<button/>', {
					class: 'btn btn-xs- btn-danger keyDelete'
				});
				propertyDelete.html('<span class="glyphicon glyphicon-trash" aria-hidden="true"></span>')

				

				var position = i;
				//console.log(position);

				//create edit value handler
				(function(index, key, element){
	        element.on('input', function(e) {updateElement(sourceElementsArray, index, key, element.val());});
	    	})(i, currentKey, propertyValue);

	    	//create delete key handler
	    	(function(index, key, element, containingDivToRemove){
	        element.click(function(e) {
	        	deleteKeyForElement(sourceElementsArray, index, key);
	        	containingDivToRemove.remove();
	        });
	    	})(i, currentKey, propertyDelete, propertyFieldAndLabel);

				//propertyValue.on('input', function(e) {updateElement(position, currentKey, e);});
				propertyFieldAndLabel.append(propertyTitle);
				floatRightDivProperty.append(propertyValue);
				floatRightDivProperty.append(propertyDelete);
				
				propertyFieldAndLabel.append(floatRightDivProperty);
				
			} else { //for chain's element field, recurse
				convertInput(propertyFieldAndLabel, sourceElementsArray[i][key], true, i);
			}
			allPropertyFields.append(propertyFieldAndLabel);
		}

		var collapseButton = jQuery('<button/>', {
			class: 'btn btn-info collapseButton',
			'data-toggle': 'collapse',
			'data-target': '#elementPropertyFields' + i + 'WithParentPosition' + chainParentPosition,
			'aria-expanded': 'false',
			'aria-controls': 'elementPropertyFields' + i + 'WithParentPosition' + chainParentPosition,
			text: String.fromCharCode(9654),
			click: function(e) {
				if ($(this).html() == String.fromCharCode(9654))
					$(this).html(String.fromCharCode(9660));
				else if ($(this).html() == String.fromCharCode(9660))
					$(this).html(String.fromCharCode(9654));	
			}
		});
		//collapseButton.on('hidden.bs.collapse hidden.bs.collapse', function () {collapseButton.prop('disabled', false);});

		var saveButton = jQuery('<button/>', {
			class: 'btn btn-default',
			text: 'Save',
			click: function() {saveElement(singleElement, position);}
		});

		singleElement.append(collapseButton);
		singleElement.append(elementTitle);

		moveArrowArea.append(moveElementLeftButton, moveElementUpButton, moveElementDownButton, moveElementRightButton);

		floatRightDivElement.append(moveArrowArea, elementDelete, elementHandle);

		singleElement.append(floatRightDivElement);
		
		singleElement.append(allPropertyFields);
		
		//singleElement.append(saveButton);

		divToAdd.append(singleElement);

		/*
		switch (sourceElementsArray[i]['shapeType']) {
			case 'line':
				console.log('found a line');
				break;
		}
		*/
	}

	//RubaXa sortable plugin
	Sortable.create(divToAdd[0], {
		draggable: '.singleElement',
		handle: '.elementHandleWithParentPosition' + chainParentPosition,
		setData: function (dataTransfer, dragEl) {
        dataTransfer.setData('Text', dragEl.textContent);
    },
    // Changed sorting within list
    onUpdate: function (/**Event*/evt) {
        var itemEl = evt.item;  // dragged HTMLElement

        var tmp = sourceElementsArray[evt.oldIndex];

        sourceElementsArray[evt.oldIndex] = sourceElementsArray[evt.newIndex];
        sourceElementsArray[evt.newIndex] = tmp;
        // + indexes from onEnd
    }
	}); // That's all.



}

var virtualWidth = 4000;
var virtualHeight = 3000;

function scaleValue(input, fromConst, toConst) {
	return (input / fromConst) * toConst;
}

function scaleToVirtualWidth(input) {
	return scaleValue(input, virtualWidth, $('#previewCanvas').width());
}

function scaleToVirtualHeight(input) {
	return scaleValue(input, virtualHeight , $('#previewCanvas').width() * (virtualHeight / virtualWidth));
}

function setBackgroundColor(color) {
	$('#previewCanvas').css('background-color', color);
}

function setupCanvasStyleAndAttr() {
	//canvas scales the drawing to it width and height attribute
	$('#previewCanvas').attr('width', $('#previewCanvas').width());
	var scaledDisplayHeight = $('#previewCanvas').width() * virtualHeight / virtualWidth;
	$('#previewCanvas').attr('height', scaledDisplayHeight);
	$('#previewCanvas').css('height', scaledDisplayHeight);
}

function updatePreviewCanvas(sourceElementsArray, chainOriginX, chainOriginY, currentContext) {
	//only set attr if not passing active context
	if (currentContext == null) {

		//setupCanvasStyleAndAttr();
	}

	var canvas = document.getElementById('previewCanvas');
	var ctx;
	var i;
	if (currentContext != null) {
		ctx = currentContext;
	} else {
		ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	var originx = chainOriginX;
	var originy = chainOriginY;

	for (i = 0; i < sourceElementsArray.length; i++) {
		var someElement = sourceElementsArray[i];

		if (!chainOriginX && !chainOriginY) {
			originx = scaleToVirtualWidth(someElement['originx']);
			originy = scaleToVirtualHeight(someElement['originy']);
		}

		function hexToRgb(hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
		}
		ctx.lineWidth = scaleToVirtualHeight(someElement['thickness']);
		
		var opacity = someElement['opacity'];
		if (!opacity)
			opacity = 1.0;

		var strokeColor = someElement['strokeColor'];
		if (strokeColor) {
			var strokergb = hexToRgb(strokeColor);
			strokeColor = "rgba(" + strokergb["r"] + "," + strokergb["g"] + "," + strokergb["b"] + "," + opacity + ")";
		}
		
		var fillColor = someElement['fillColor'];
		if (fillColor) {
			var fillrgb = hexToRgb(fillColor);
			fillColor = "rgba(" + fillrgb["r"] + "," + fillrgb["g"] + "," + fillrgb["b"] + "," + opacity + ")";
		}

		switch(someElement['shapeType']) {
			
			case 'line':
				var line = new Path2D();
				ctx.fillStyle = fillColor;
		    ctx.strokeStyle = strokeColor;
		 		line.moveTo(originx, originy);
    		line.lineTo(scaleToVirtualWidth(someElement['endx']), scaleToVirtualHeight(someElement['endy']));
     		ctx.stroke(line);
			break;
			case 'rectangle':
				if (strokeColor && fillColor) {
					ctx.fillStyle = fillColor;
		    	ctx.strokeStyle = strokeColor;
					ctx.strokeRect(originx, originy, scaleToVirtualWidth(someElement['width']), scaleToVirtualHeight(someElement['height']));
					ctx.fillRect(originx, originy, scaleToVirtualWidth(someElement['width']), scaleToVirtualHeight(someElement['height']));
				} else if (fillColor) {
					ctx.fillStyle = fillColor;
					ctx.fillRect(originx, originy, scaleToVirtualWidth(someElement['width']), scaleToVirtualHeight(someElement['height']));
				} else {
					if (!strokeColor)
						strokeColor = '#000000';
					ctx.strokeStyle = strokeColor;
					ctx.strokeRect(originx, originy, scaleToVirtualWidth(someElement['width']), scaleToVirtualHeight(someElement['height']));
				}
				break;
			case 'arc':
				var path = new Path2D();
				path.arc(originx, originy, scaleToVirtualHeight(someElement['radius']), someElement['startAngle'] * Math.PI / 180, someElement['endAngle']  * Math.PI / 180, true);

				if (strokeColor && fillColor) {
					ctx.fillStyle = fillColor;
		    	ctx.strokeStyle = strokeColor;
					ctx.stroke(path);
					ctx.fill(path);
				} else if (fillColor) {
					ctx.fillStyle = fillColor;
					ctx.fill(path);
				} else {
					if (!strokeColor)
						strokeColor = '#000000';
					ctx.strokeStyle = strokeColor;
					ctx.stroke(path);
				}
				break;
			case 'circle':
				var path = new Path2D();
				path.arc(originx, originy, scaleToVirtualHeight(someElement['radius']), 0, Math.PI * 2, true);

				if (strokeColor && fillColor) {
					ctx.fillStyle = fillColor;
		    	ctx.strokeStyle = strokeColor;
					ctx.stroke(path);
					ctx.fill(path);
				} else if (fillColor) {
					ctx.fillStyle = fillColor;
					ctx.fill(path);
				} else {
					if (!strokeColor)
						strokeColor = '#000000';
					ctx.strokeStyle = strokeColor;
					ctx.stroke(path);
				}
				break;
			case 'ellipse':
				var path = new Path2D();
				path.ellipse(scaleToVirtualWidth(someElement['originx'] + someElement['width'] / 2), scaleToVirtualHeight(someElement['originy'] + someElement['height'] / 2), scaleToVirtualHeight(someElement['width'] / 2), scaleToVirtualHeight(someElement['height'] / 2), 0, 0, Math.PI * 2, true);

				if (strokeColor && fillColor) {
					ctx.fillStyle = fillColor;
		    	ctx.strokeStyle = strokeColor;
					ctx.stroke(path);
					ctx.fill(path);
				} else if (fillColor) {
					ctx.fillStyle = fillColor;
					ctx.fill(path);
				} else {
					if (!strokeColor)
						strokeColor = '#000000';
					ctx.strokeStyle = strokeColor;
					ctx.stroke(path);
				}
				break;
			case 'curve':
				var path = new Path2D();
		    path.moveTo(originx, originy);
		    if (someElement['controlPoint2x'] && someElement['controlPoint2y']) {
		    	//console.log('bezier curve');
		    	//console.log(someElement['controlPoint1x'], someElement['controlPoint1y'], someElement['controlPoint2x'], someElement['controlPoint2y'], someElement['endx'], someElement['endy'])
		    	//glob = someElement;
		    	path.bezierCurveTo(scaleToVirtualWidth(someElement['controlPoint1x']), scaleToVirtualHeight(someElement['controlPoint1y']), scaleToVirtualWidth(someElement['controlPoint2x']), scaleToVirtualHeight(someElement['controlPoint2y']), scaleToVirtualWidth(someElement['endx']), scaleToVirtualHeight(someElement['endy']));
		    }
		    else
		    	path.quadraticCurveTo(scaleToVirtualWidth(someElement['controlPoint1x']), scaleToVirtualHeight(someElement['controlPoint1y']), scaleToVirtualWidth(someElement['endx']), scaleToVirtualHeight(someElement['endy']));
				
		    if (strokeColor && fillColor) {
		    	ctx.fillStyle = fillColor;
		    	ctx.strokeStyle = strokeColor;
					ctx.stroke(path);
					ctx.fill(path);
				} else if (fillColor) {
					ctx.fillStyle = fillColor;
					ctx.fill(path);
				} else {
					if (!strokeColor)
						strokeColor = '#000000';
					ctx.strokeStyle = strokeColor;

					ctx.stroke(path);
				}
				break;
			case 'text':
				ctx.strokeStyle = 'rgba(255,0,0,0.5)';
				ctx.strokeRect(originx, originy, scaleToVirtualWidth(someElement['width']), scaleToVirtualHeight(someElement['height']));
				//http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
				//MODIFIED FOR LINE BREAKS
				function wrapText(context, text, x, y, maxWidth, lineHeight) {
	        var words = text.split(' '); 
	        var line = '';


	        for(var n = 0; n < words.length; n++) {
	        	var splitByNewline = words[n].split('\n');

	        	//handle new lines
	        	if (splitByNewline.length == 1) {
	        		var testLine = line + words[n] + ' ';
		          var metrics = context.measureText(testLine);
		          var testWidth = metrics.width;
		          if (testWidth > maxWidth && n > 0) {
		            context.fillText(line, x, y);
		            line = words[n] + ' ';
		            y += lineHeight;
		          }
		          else {
		            line = testLine;
		          }
	        	} else {
	        		//add first segment as usual
							var testLine = line + splitByNewline[0] + ' ';
		          var metrics = context.measureText(testLine);
		          var testWidth = metrics.width;
		 
		 					//but start new line and setup line variable for next loop
		            context.fillText(testLine, x, y);
		            line = splitByNewline[1] + ' ';
		            y += lineHeight;

		          if (splitByNewline.length > 2) {
		        		for (var sl = 2; sl < splitByNewline.length; sl++) {
		        			context.fillText(line, x, y);
			            line = splitByNewline[sl] + ' ';
			            y += lineHeight;
		        		}
		        	}
	        	}
	          
	        }
	        context.fillText(line, x, y);
	      }

				ctx.font = '' + String(scaleToVirtualHeight(someElement['fontHeight'])) + 'px HelveticaNeue-Light, Helvetica Neue Light, Helvetica Neue, Helvetica, Arial, Lucida Grande, sans-serif';
				//console.log(ctx.font);

				if (!strokeColor)
					strokeColor = '#000000';
				ctx.fillStyle = strokeColor;
				
				ctx.textAlign = someElement['alignment']; 
				if (!someElement['alignment']) {

					ctx.textAlign = 'left'; 
				}
				if (ctx.textAlign == 'center')
					originx += scaleToVirtualWidth(someElement['width']) / 2;
				
  			wrapText(ctx, someElement['text'], originx, originy + scaleToVirtualHeight(someElement['fontHeight']), scaleToVirtualWidth(someElement['width']), scaleToVirtualHeight(someElement['fontHeight']));
  			break;
  		case 'chain':
  			updatePreviewCanvas(someElement['elements'], scaleToVirtualWidth(someElement['originx']), scaleToVirtualHeight(someElement['originy']), ctx);
  			break;
  			
		}	

		if (chainOriginX && chainOriginY) {
			originx = scaleToVirtualWidth(someElement['endx']);
			originy = scaleToVirtualHeight(someElement['endy']);
		}
	}
}

function updateElement(targetElementsArray, position, attribute, elementValue) {
	if (!isNaN(elementValue))
		targetElementsArray[position][attribute] = parseInt(elementValue);
	else
		targetElementsArray[position][attribute] = elementValue;
	setBackgroundColor(masterFile.parsed['bgcolor']);
	updatePreviewCanvas(masterFile.parsed['elements'], null, null);
	printCurrentFileData();
}

function moveElement(targetElementsArray, position, direction, amount) {
	var pixelDir;

	var affectedProperties;
	var affectedPropertiesX = ['originx','endx', 'controlPoint1x', 'controlPoint2x'];
	var affectedPropertiesY = ['originy', 'endy', 'controlPoint1y', 'controlPoint2y'];

	switch (direction) {
		case 'left':
			pixelDir = -1;
			affectedProperties = affectedPropertiesX;
			break;
		case 'up':
			pixelDir = -1;
			affectedProperties = affectedPropertiesY;
			break;
		case 'down':
			pixelDir = 1;
			affectedProperties = affectedPropertiesY;
			break;
		case 'right':
			pixelDir = 1;
			affectedProperties = affectedPropertiesX;
			break;
		default:
			console.log("unknown direction", direction);
	}

	

	var i;
	for (i = 0; i < affectedProperties.length; i++) {
		if (targetElementsArray[position][affectedProperties[i]])
			targetElementsArray[position][affectedProperties[i]] += pixelDir * amount;
	}

	setBackgroundColor(masterFile.parsed['bgcolor']);
	updatePreviewCanvas(masterFile.parsed['elements'], null, null);
	printCurrentFileData();
}

function deleteElement(targetElementsArray, position) {
	console.log(targetElementsArray, position);

	targetElementsArray.remove(position);

	updateToUpdatedFileStruct();
	printCurrentFileData();
}

function deleteKeyForElement(targetElementsArray, position, attribute) {
	delete targetElementsArray[position][attribute];

	setBackgroundColor(masterFile.parsed['bgcolor']);
	updatePreviewCanvas(masterFile.parsed['elements'], null, null);
	printCurrentFileData();
}

function saveElement(elementDiv, i) {
	console.log(elementDiv, i);
}