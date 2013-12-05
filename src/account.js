var pg = require('pg'); 
var conString = "postgres://challenge_user:123mudar@localhost/challenge";

var client = new pg.Client(conString);

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
		pg.connect(conString, function(err, client, done) {
			if (err) {
				return console.error('error fetching client from pool', err);
			}
			client.query('SELECT balance FROM account WHERE id = ' + id, function(err, result) {
				done();
				if (err) {
					return console.error('error reading account balance' , err);
				}
				callback(result.rows[0].balance);
			});
		});
	}
	return account;
}

exports.find = find;
