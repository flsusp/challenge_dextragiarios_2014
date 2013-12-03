function find(id) {
	var account = {};
	account.id = id;
	account.debit = function(value) {
		console.log('debit of ' + value);
	}
	account.credit = function(value) {
		console.log('credit of ' + value);
	}
	account.balance = function(callback) {
		callback(0);
	}
	return account;
}

exports.find = find;
