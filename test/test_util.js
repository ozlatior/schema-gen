const getElementByValue = function(arr, key, value) {
	for (let i=0; i<arr.length; i++)
		if (arr[i][key] === value)
			return arr[i];
	return null;
};

module.exports.getElementByValue = getElementByValue;
