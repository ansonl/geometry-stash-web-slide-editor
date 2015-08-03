function makeStruct(names) {
  var names = names.split(' ');
  var count = names.length;
  function constructor() {
    for (var i = 0; i < count; i++) {
      this[names[i]] = arguments[i];
    }
  }
  return constructor;
}

function printStruct(theStruct) {
	var dictString = '{\n';
	for (var key in theStruct) {
		if (theStruct.hasOwnProperty(key)) {
			dictString += '\"' + key + '\" : ';
			if (isNaN(theStruct[key])) {
				dictString += '\"' + theStruct[key] + '\"';
			} else {
				dictString += theStruct[key];
			}
			dictString += '\,';
		}
	}

	 dictString = dictString.substring(0,dictString.length - 1);

	dictString += '\n}\n';

	return dictString;
}