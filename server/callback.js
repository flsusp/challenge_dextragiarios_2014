function call(callback) {
	var args = arguments;
	var parameters = Object.keys(args).map(function (key) { return args[key]; }).slice(1, arguments.length);
	if (callback) {
		callback.apply(this, parameters);
	}
}

exports.call = call;
