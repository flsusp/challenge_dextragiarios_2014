var call = require("./callback").call;

function debitFee(value, callback) {
	if (value < 5) {
		call(callback, 0.15); // 15%
	} else if (value < 20) {
		call(callback, 0.1);  // 10%
	} else if (value < 500) {
		call(callback, 0.07); // 7%
	} else {
		call(callback, 0.05); // 5%
	}
}
exports.debitFee = debitFee;