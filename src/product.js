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

	product.addStock = function(quantity, client, done, callback) {
		client.query('INSERT INTO stock (idProduct, relativeQuantity) VALUES('+ id + ',' + quantity + ') ', 
			function(err, result) {
				done();
				call(callback, 'success');
			});
	}


	var updateStock = function(quantity, callback) {
		quantity = parseInt(quantity);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback, 'error');
		      	return;
			}
			if (quantity > 0) {
				product.addStock(quantity, client, done, callback);
				return;
			}
			product.stock(function(stock) {
				if ((stock + quantity) < 0) {
					console.log('insufficient quantity', err);
					call(callback, 'error');
					return;
				}
				product.addStock(quantity, client, done, callback);
			});
		});
	}

	product.stock = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			client.query('SELECT sum(relativeQuantity) as "soma" FROM stock WHERE idProduct =' + id, 
				function(err, result) {
						done();
						if (err) {
							console.log('error reading stock', err);
							call(callback, 'error');
							return;
						}
						call(callback, parseInt(result.rows[0].soma));
						return;
					});
				//call(callback, 'success');
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
