var pg = require('pg'); 
var nconf = require('nconf');

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);

function find(id) {
	var account = {};
	account.id = id;
	account.transact = function(value, callback) {
		value = parseInt(value);
		account.balance(function(balance) {
			balance = parseInt(balance);
			var newBalance = balance + value;
			if (value > 0 || newBalance >= 0) {
				pg.connect(conString, function(err, client, done) {
					if (err) {
			           	return console.log('error fetching client from pool', err);
					}
					client.query('UPDATE account SET balance = ' + newBalance + ' WHERE id = ' + id, function(err, result) {
						done();
						if (err) {
							return console.log('error reading account balance' , err);
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
		           	return console.log('error fetching client from pool', err);
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
