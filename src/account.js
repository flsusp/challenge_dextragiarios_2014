var pg = require('pg'); 
var nconf = require('nconf');

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);

function find(id) {
	var account = {};
	account.id = id;

	account.addValue = function(value, client, done, callback) {
		client.query('INSERT INTO transfers(idAccount, relativeValue) VALUES('+ id + ',' + value + ') ', 
			function(err, result) {
				done();
				call(callback, 'success');
			});
	}


	account.transact = function(value, callback) {
		value = parseInt(value);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback, 'error');
		      	return;
			}
			if (value > 0) {
				account.addValue(value, client, done, callback);
				return;
			}
			account.balance(function(balance) {
				// if (balance < 0) {
				// 	console.log('Oh my God!!! Balance for account ' + id + ' is ' + balance);
				// }
				// if ((balance + value) < 0) {
				// 	console.log('insufficient value', err);
				// 	call(callback, 'error');
				// 	return;
				// }
				account.addValue(value, client, done, callback);
			});
		});
	}

	account.balance = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			client.query('SELECT sum(relativeValue) FROM transfers WHERE idAccount =' + id, 
				function(err, result) {
						done();
						if (err) {
							console.log('error reading transfers', err);
							call(callback, 'error');
							return;
						}
						call(callback, parseInt(result.rows[0].sum));
						return;
					});
				//call(callback, 'to aqui');
		});
	}

	return account;
}

exports.find = find;
