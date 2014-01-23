var pg = require('pg'); 
var nconf = require('nconf');

var integration = require("./integration")
var account = require("./account")

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);

function find(id) {
	var product = {};
	product.id = id;
	product.purchase = function(accountId, quantity, callback) {
		product.price(function(price) {
			integration.debitFee(price, function(extra) {
				account.find(accountId).transact(-(extra + price), function() {
					updateStock(-quantity, callback);	
				});
			});
		});
	}
	product.add = function(quantity, callback) {
		updateStock(quantity, callback);
	}


	var updateStock = function(quantity, callback) {
		quantity = parseInt(quantity);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback, 'error');
		      	return;
			} 
			client.query('UPDATE product SET stock = CASE WHEN (stock + ' + quantity +' > 0 AND id = ' + id + ') THEN stock + ' + quantity + ' ELSE stock END', function(err, result) {
				done();
				if (result.rowCount == 0) {
					console.log('error product stock', err);
					call(callback, 'error');
					return;
				}
				if (err) {
					console.log('error reading product stock', err);
					call(callback, 'error');
					return;
				}
				call(callback, 'success');
			});
		});
	}




	product.stock = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			client.query('SELECT stock FROM product WHERE id = ' + id, function(err, result) {
				done();
				if (err) {
		           	return console.log('error fetching client from pool', err);
				}
				if (result.rows.length == 0) {
					call(callback, null);
				} else {
					call(callback, parseInt(result.rows[0].stock));
				}
			});
		});
	}
	product.price = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			client.query('SELECT price FROM product WHERE id = ' + id, function(err, result) {
				done();
				if (err) {
		           	return console.log('error fetching client from pool', err);
				}
				if (result.rows.length == 0) {
					call(callback, null);
				} else {
					call(callback, parseFloat(result.rows[0].price));
				}
			});
		});
	}
	return product;
}






exports.find = find;
