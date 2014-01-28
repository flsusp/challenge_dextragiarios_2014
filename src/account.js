var pg = require('pg'); 
var nconf = require('nconf');

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);

function find(id) {
	var account = {};
	account.id = id;

	account.addValue = function(value, max, client, done, callback) {
		var query;
		if (max < 0) {	
			query = 'INSERT INTO transfers(idAccount, relativeValue) VALUES('+ id + ',' + value + ') ';
		} else {
			query = 'INSERT INTO transfers(idAccount, relativeValue, idAnt) VALUES('+ id + ',' + value + ',' + max + ')';
		}

		client.query(query, 
			function(err, result) {
				done();				
				if (err) {
					//retry(value,callback);
					account.transact(value, callback);
					//call(callback, err);
					return;
				}
				call(callback, false);
			});
	}

	
	account.transact = function(value, callback) {
		value = parseInt(value);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback, true);
		      	return;
			}
			if (value > 0) {
				account.addValue(value, -1, client, done, callback);
				return;
			}
			readBalance(client, function(err, balance, max) {
				if (balance < 0) {
					console.log('<<Oh my God!!! Balance for account ' + id + ' is ' + balance + '<<<<<<');
				}
				if ((balance + value) < 0) {
					done();
					console.log('insufficient value');
					call(callback, true);
					return;
				}
				account.addValue(value, max, client, done, callback);
			});
		});
	}

	var readBalance = function(client, callback) {
		client.query('SELECT sum(relativeValue), max(id) FROM transfers WHERE idAccount =' + id, 
				function(err, result) {
						if (err) {
							console.log('error reading transfers');
							call(callback, err);
							return;
						}
						call(callback, null, parseInt(result.rows[0].sum), parseInt(result.rows[0].max));
						return;
					});
	}

	account.balance = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			readBalance(client, 
				function(err, result) {
						done();
						if (err) {
							console.log('error reading transfers', err);
							call(callback, 'error');
							return;
						}
						call(callback, result);
						return;
					});
		});
	}

	return account;
}

exports.find = find;
