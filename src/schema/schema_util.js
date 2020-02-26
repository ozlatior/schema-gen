const expandInvalidDefinitions = function(obj) {
	let ret = JSON.parse(JSON.stringify(obj));
	for (let i in ret) {
		ret[i].short = i;
		ret[i].valid = false;
	}
	ret.OK.valid = true;
	return ret;
};

const getResult = function(def, path, expected, actual) {
	let ret = JSON.parse(JSON.stringify(def));

	if (path !== undefined)
		ret.reason = ret.reason.replace("%path%", path);
	if (expected !== undefined)
		ret.reason = ret.reason.replace("%expected%", expected);
	if (actual !== undefined)
		ret.reason = ret.reason.replace("%actual%", actual);

	return ret;
};

const formatRange = function(range, strictLeft, strictRight) {
	let ret = range[0] + "," + range[1];
	if (strictLeft || range[2] === true)
		ret = "(" + ret;
	else
		ret = "[" + ret;
	if (strictRight || range[3] === true)
		ret += ")";
	else
		ret += "]";
	return ret;
};

module.exports.expandInvalidDefinitions = expandInvalidDefinitions;
module.exports.getResult = getResult;
module.exports.formatRange = formatRange;
