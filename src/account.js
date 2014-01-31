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

function findTransfer(id) {
	var transaction = {};
	transaction.id = id;

	transaction.getStatus = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback);
			   	return;
			}
			client.query('select consolidada from transfers where id = ' + id, 
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
	return transaction;
}


function find(id) {
	var account = {};
	account.id = id;

	account.addValue = function(value, client, done, callback) {
		client.query('insert into transfers(idAccount, relativeValue) VALUES('+ id + ',' + value + ') RETURNING ID', 
			function(err, result) {
				done();
				if (err) {
					console.log('ERRO AO INSERIR');
					return call(callback, null, true);
				}
				call(callback, result.rows[0].id);
			});
	}

	account.consolidar = function(opts) {

		var c = opts.callback || function(){};
		var idProduct = opts.idProduct || null;
		var quantidade = opts.quantidade || null;

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

			readBalance(client, function(erro, saldo) {
				var drain = function() {
					done();
					unbindDrain();
					call(callback, 'success');
				};
				var unbindDrain = function() {
					client.removeListener('drain', drain);
				}
				client.on('drain', drain);
				client.query('select id, relativeValue from transfers where idAccount=' + id + ' AND consolidada = false ORDER BY id ASC',
					function(err, result) {
						console.log('consolida', row.id, row.relativevalue, saldo);
						saldo = parseInt(saldo) + parseInt(row.relativevalue);
						if (saldo >= 0) {
							var update = client.query('UPDATE transfers set consolidada = true WHERE id = ' + row.id + ' AND consolidada = false');
							update.on('end', function() {
								console.log('update finalizado');
							});
						} else {
							var queryDelete = client.query('delete from transfers where id = ' + row.id);
							queryDelete.on('end', function() {
								console.info('delete finalizado');
								if (idProduct != null && quantidade != null) {
									var queryPog = client.query('insert into stock(idProduct, relativeQuantity, consolidada) values(' + idProduct + ',' + quantidade + ', true)');
									queryPog.on('end', function() {
										console.info('insertizinho de leve');
									});
								}
							});
						}
					});
				//var query;
				// query.on('row', function(row) {
				// 	console.log('consolida', row.id, row.relativevalue, saldo);
				// 	saldo = parseInt(saldo) + parseInt(row.relativevalue);
				// 	if (saldo >= 0) {
				// 		var update = client.query('UPDATE transfers set consolidada = true WHERE id = ' + row.id + ' AND consolidada = false');
				// 		update.on('end', function() {
				// 			console.log('update finalizado');
				// 		});
				// 	} else {
				// 		var queryDelete = client.query('delete from transfers where id = ' + row.id);
				// 		queryDelete.on('end', function() {
				// 			console.info('delete finalizado');
				// 			if (idProduct != null && quantidade != null) {
				// 				var queryPog = client.query('insert into stock(idProduct, relativeQuantity, consolidada) values(' + idProduct + ',' + quantidade + ', true)');
				// 				queryPog.on('end', function() {
				// 					console.info('insertizinho de leve');
				// 				});
				// 			}
				// 		});
				// 	}
				// });
			});
		});
	}

	account.transact = function(value, callback) {
		value = parseFloat(value);
		pg.connect(conString, function(err, client, done) {
			if (err) {
				console.log('error fetching client from pool', err);
				call(callback, null, true);
		      	return;
			}
			account.addValue(value, client, done, callback);
		});
	}

	var readBalance = function(client, callback) {
		client.query('SELECT sum(relativeValue) as "sum" FROM transfers WHERE idAccount =' + id + ' AND consolidada = true GROUP BY idAccount', 
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

	account.balance = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			readBalance(client, 
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

	return account;
}

exports.find = find;
exports.validaLogin = validaLogin;
exports.findTransfer = findTransfer;
