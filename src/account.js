var pg = require('pg'); 
var conString = "postgres://challenge_user:123mudar@localhost/challenge";

var client = new pg.Client(conString);

function find(id) {
	var account = {};
	account.id = id;
	account.transact = function(value, callback) {
		account.balance(function(balance) {
			pg.connect(conString, function(err, client, done) {
				if (err) {
					return console.error('error fetching client from pool', err);
				}
				client.query('UPDATE account SET balance = ' + (balance + value) + ' WHERE id = ' + id, function(err, result) {
					done();
					if (err) {
						return console.error('error reading account balance' , err);
					}
					callback();
				});
			});
		});
	}
	account.balance = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				return console.error('error fetching client from pool', err);
			}
			client.query('SELECT balance FROM account WHERE id = ' + id, function(err, result) {
				done();
				if (err) {
					return console.error('error reading account balance' , err);
				}
				callback(parseInt(result.rows[0].balance));
			});
		});
	}
	return account;
}

exports.find = find;
