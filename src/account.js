var pg = require('pg'); 
var nconf = require('nconf');

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);

function validaLogin(id, callback) {
	pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			client.query('SELECT id FROM account WHERE id ='+id, function(err, result) {
				done();
				if (err) {
		           	return console.log('error ', err);
				}
				call(callback, result.rows[0]);
				
			});
		});
}

function find(id) {
	var account = {};
	account.id = id;
	account.transact = function(value, callback) {
		//TODO: por aqui
		value = parseInt(value);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				return console.log('error fetching client from pool', err);
			}
			client.query('UPDATE account SET balance = balance + ' + value + ' WHERE id = ' + id + ' AND balance + ' + value + ' >= 0;', function(err, result) {
				done();
				if (err) {
					return console.log('error reading account balance' , err);
				}
				if (result.rowCount == 0) {
					call(callback, 'not enough funds to transact');
				} else {
					call(callback, 'success');
				}
			});
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
exports.validaLogin = validaLogin;