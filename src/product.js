var pg = require('pg'); 
var nconf = require('nconf');

var integration = require("./integration")
var account = require("./account")

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);


function findStock(id) {
	var stock = {};
	stock.id = id;

	stock.getStatus = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback);
			   	return;
			}
			client.query('select consolidada from stock where id = ' + id, 
				function(err, result) {
					done();
					if (err) {
						console.log('ERRO AO SELECIONAR');
						return call(callback);
					}
					if (result.rows.length <= 0) {
						call(callback, false);
					} else {
						call(callback, result.rows[0].consolidada);
					}
				});
		});
	}
	return stock;
}

function find(id) {
	var product = {};
	product.id = id;

	product.purchase = function(accountId, quantity, callback) {
		product.price(function(price) {
			integration.debitFee(price*quantity, function(extra) {
				account.find(accountId).transact(-(extra+1)*(price*quantity), function(id, err) {
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


	product.addStock = function(value, client, done, callback) {
		client.query('insert into stock(idProduct, relativeQuantity) VALUES('+ id + ',' + value + ') RETURNING ID', 
			function(err, result) {
				done();
				if (err) {
					console.log('ERRO AO INSERIR');
					return call(callback);
				}
				call(callback, result.rows[0].id);
			});
	}

	product.consolidar = function(c) {
		var callback = function() {
			console.log('Finalizando consolidacao', id);
			call(c);
		}
		console.log('Iniciando consolidacao', id);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback, true);
		      	return;
			}

			readStock(client, function(erro, stock) {
				var drain = function() {
					done();
					unbindDrain();
					call(callback, 'success');
				};
				var unbindDrain = function() {
					client.removeListener('drain', drain);
				}
				client.on('drain', drain);
				var query = client.query('select id, relativeQuantity from stock where idProduct=' + id + ' AND consolidada = false ORDER BY id ASC');
				query.on('row', function(row) {
					console.log('consolida', row.id, row.relativequantity, stock);
					stock = parseInt(stock) + parseInt(row.relativequantity);
					if (stock >= 0) {
						var update = client.query('UPDATE stock set consolidada = true WHERE id = ' + row.id + ' AND consolidada = false');
						update.on('end', function() {
							console.log('update finalizado');
						});
					} else {
						var queryDelete = client.query('delete from stock where id = ' + row.id);
						queryDelete.on('end', function() {
							console.info('delete finalizado');
						});
					}
				});
			});
		});
	}

	var updateStock = function(value, callback) {
		value = parseInt(value);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback, -1);
		      	return;
			}
			product.addStock(value, client, done, callback);
		});
	}

	var readStock = function(client, callback) {
		client.query('SELECT sum(relativeQuantity) as "sum" FROM stock WHERE idProduct =' + id + ' AND consolidada = true GROUP BY idProduct', 
				function(err, result) {
						if (err) {
							console.log('error reading saldo');
							call(callback, err);
							return;
						}
						if (result.rows.length <= 0) {
							return call(callback, null, 0);
						}
						if (parseInt(result.rows[0].sum) < 0) {
							console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< NEGATIVO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
						}
						call(callback, null, parseInt(result.rows[0].sum));
						return;
					});
	}

	product.stock = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			readStock(client, 
				function(erro, result) {
						done();
						if (erro) {
							console.log('error reading transfers', erro);
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
