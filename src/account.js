var pg = require('pg'); 
var nconf = require('nconf');

var async = require('async');

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);

function find(id) {
	var account = {};
	account.id = id;

	account.addValue = function(value, client, done, callback) {
		client.query('insert into transfers(idAccount, relativeValue) VALUES('+ id + ',' + value + ')', 
			function(err, result) {
				done();
				if (err) {
					console.log('ERRO AO INSERIR');
					return;
				}
				call(callback);
			});
	}

	account.consolidar = function(c) {
		var t = new Date().getTime();
		var callback = function() {
			console.log('Finalizando consolidacao', id);
			call(c);
		}
		console.log('Iniciando consolidacao', id, t);
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

				var query = client.query('select id, relativeValue from transfers where idAccount=' + id + ' AND consolidada = false ORDER BY id ASC');
				query.on('row', function(row) {
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
						});
					}
				});
			});


/*			client.query('select id, relativeValue from transfers where idAccount=' + id + ' AND consolidada = false ORDER BY id ASC',
				function(err, result) {
					if (err) {
						console.log('ERRO AO CONSOLIDAR', err);
						return;
					}
					
					readBalance(client, function(erro, saldo) {
						var consolida = function(saldoAtual, i, max) {
							console.log('consolida', saldoAtual, i, max, result.rows[i].relativevalue, result.rows[i].id);
							var relative = parseInt(saldoAtual) + parseInt(result.rows[i].relativevalue);
							if (relative >= 0) {
								client.query('UPDATE transfers set consolidada = true WHERE id = ' + result.rows[i].id + ' AND consolidada = false', 
									function(errr, resultt) {
										if (errr) {
											console.log('ERRO NO UPDATE');
											return;
										}
										if (i == max) {
											console.log('done', t);
											done();
											call(callback, 'success');
										} else {
											consolida(relative, i + 1, max);
										}
									});
							} else {
								client.query('delete from transfers where id = ' + result.rows[i].id,
									function(err, result) {
										done();
										if (err) {
											console.log('ERRO AO DELETAR', err);
											return;
										}
										console.info('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<DELETOU>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
										call(callback, 'success');
									});
							}
						}

						if (result.rows.length > 0) {
							consolida(saldo, 0, result.rows.length - 1);
						}

					});
				});
*/
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
