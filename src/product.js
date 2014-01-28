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
			integration.debitFee(price*quantity, function(extra) {
				account.find(accountId).transact(-(extra+1)*(price*quantity), function(err) {
					if (err){						
						call(callback,'error');
						return;
					}
					updateStock(-quantity, callback);	
				});
			});
		});
	}

	product.add = function(quantity, callback) {
		updateStock(quantity, callback);
	}

	product.addStock = function(quantity, max, client, done, callback) {
		var query;
		if (max < 0) {	
			query = 'INSERT INTO stock (idProduct, relativeQuantity) VALUES('+ id + ',' + quantity + ') ';
		} else {
			query = 'INSERT INTO stock (idProduct, relativeQuantity, idAnt) VALUES('+ id + ',' + quantity + ','+max+') ';
			
		}

		client.query(query, 
			function(err, result) {
				done();				
				if (err) {
					updateStock(quantity, callback);
					return;
				}
				call(callback, false);
			});
	}

	var updateStock = function(quantity, callback) {
		quantity = parseInt(quantity);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool');
				call(callback, 'error');
		      	return;
			}
			if (quantity > 0) {
				product.addStock(quantity,-1, client, done, callback);
				return;
			}
			readStock(client, function(err, stock, max) {
				if (stock < 0) {
					console.log('Oh my God!!! Stock for product', id, 'is', stock);
				}

				if ((stock + quantity) < 0) {
					console.log('insufficient quantity');
					call(callback, 'error');
					return;
				}
				product.addStock(quantity, max, client, done, callback);
			});
		});
	}

	var readStock = function(client, callback) {
		client.query('SELECT sum(relativeQuantity), max(id) FROM stock WHERE idProduct =' + id, 
				function(err, result) {
						if (err) {
							console.log('error reading stock');
							call(callback, err);
							return;
						}
						call(callback, null, parseInt(result.rows[0].sum), parseInt(result.rows[0].max));
						return;
					});
	}

	product.stock = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			readStock(client,
				function(err, result) {
						done();
						if (err) {
							console.log('error reading stock');
							call(callback, 'error');
							return;
						}
						call(callback, result);
						return;
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
		           	return console.log('error fetching client from pool');
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
