var pg = require('pg');

var conString = require("./../src/config").config().get('conString');

var product = require("./../src/product");

var vows = require('vows'),
	assert = require('assert'),
	async = require('async');

var loadData = {};

loadData.createProductWithStock = function (price, stock, callback) {
	pg.connect(conString, function(err, client, done) {
       	if (err) {
           	return console.log('error fetching client from pool', err);
        }        
		client.query('INSERT INTO product (price) VALUES (' + price + ') RETURNING id', function(err, result) {
			done();			
			client.query('INSERT INTO stock (idProduct, relativeQuantity) VALUES (' + result.rows[0].id + ',' + stock + ')', function(errr, resultt) {
				done();				
				callback(result.rows[0].id);				
			});			
			
		});
	});
};
loadData.createAccountWithBalance = function (balance, nome, callback) {
	pg.connect(conString, function(err, client, done) {
       	if (err) {
           	return console.log('error fetching client from pool', err);
        }        
		client.query('INSERT INTO account (nome) VALUES (\''+nome +'\') RETURNING id', function(err, result) {
			done();			
			client.query('INSERT INTO transfers(idAccount, relativeValue) VALUES (' + result.rows[0].id + ', ' + balance + ')', function(errr, resultt) {
				done();				
				callback(result.rows[0].id);
			});
		});
	});
};

vows.describe('Given a product with price of 3 and stock of 20').addBatch({
	'when read the product stock': {
       	topic: function () {
			var c = this.callback;
			loadData.createProductWithStock(3, 20, function(id) {
				product.find(id).stock(function(stock) {
					c(null, stock);
				});
			});
		},

    	'then stock equals 20': function (topic) {
    		assert.equal(topic, 20);
        }
	}
}).addBatch({
	'when adding 12 at the product stock': {
       	topic: function () {
			var c = this.callback;
			loadData.createProductWithStock(3, 20, function(id) {
				product.find(id).add(12, function() {
					product.find(id).stock(function(stock) {
						c(null, stock);
					});
				});
			});
		},

		'then stock equals 32': function (topic) {
        		assert.equal (topic, 32);
		}
	}
}).addBatch({
	'when purchasing 9 from the product stock': {
       	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, 'asd', function(accountId) {
				loadData.createProductWithStock(3, 20, function(id) {
					product.find(id).purchase(accountId, 9, function() {
						product.find(id).stock(function(stock) {
							c(null, stock);
						});
					});
				});
			});
		},

		'then stock equals 11': function (topic) {
			assert.equal (topic, 11);
		}
	}
}).addBatch({
	'when purchasing 22 from the product stock': {
       	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, 'asd', function(accountId) {
				loadData.createProductWithStock(3, 20, function(id) {
					product.find(id).purchase(accountId, 22, function() {
						product.find(id).stock(function(stock) {
							c(null, stock);
						});
					});
				});
			});
		},

		'then stock still equals 20': function (topic) {
        		assert.equal (topic, 20);
		}
	}
}).addBatch({
	'when purchasing 8, one by one in parallel, from the product stock': {
       	topic: function () {
			var c = this.callback;

			loadData.createAccountWithBalance(11, 'asd', function(accountId) {
				loadData.createProductWithStock(3, 20, function(id) {
					var functions = [];
					for (var i = 0; i < 8; i++) {
						functions.push(function(callback) {
							product.find(id).purchase(accountId, 1, function() {
								callback();
							});
						});
					}
					
					async.parallel(functions, function() {
						product.find(id).stock(function(stock) {
							c(null, stock);
						});
					});
				});
			});
		},

		'then stock equals 12': function (topic) {
        		assert.equal (topic, 12);
		}
	}
}).export(module);