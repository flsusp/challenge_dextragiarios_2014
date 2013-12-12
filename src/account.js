var pg = require('pg'); 
var conString = "postgres://challenge_user:123mudar@localhost/challenge";
var call = require("./callback").call;

var client = new pg.Client(conString);

function find(id) {
	var account = {};
	account.id = id;
	account.transact = function(value, callback) {
		account.balance(function(balance) {
			if (value > 0 || balance + value >= 0) {
				pg.connect(conString, function(err, client, done) {
					if (err) {
						throw err;
					}
					client.query('UPDATE account SET balance = ' + (balance + value) + ' WHERE id = ' + id, function(err, result) {
						done();
						if (err) {
							return console.error('error reading account balance' , err);
						}
						call(callback);
					});
				});
			} else {
				call(callback);
			}
		});
	}
	account.balance = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			client.query('SELECT balance FROM account WHERE id = ' + id, function(err, result) {
				done();
				if (err) {
					throw err;
				}
				if (result.rows.length == 0) {
					call(callback, null);
				} else {
					call(callback, parseInt(result.rows[0].balance));
				}
			});
		});
	}
	return account;
}

exports.find = find;
