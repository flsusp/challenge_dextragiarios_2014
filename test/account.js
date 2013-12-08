var pg = require('pg');
var conString = "postgres://challenge_user:123mudar@localhost/challenge";

var account = require("./../src/account");

var vows = require('vows'),
	assert = require('assert'),
	async = require('async');

var loadData = {};
loadData.createAccountWithBalance = function (balance, callback) {
	pg.connect(conString, function(err, client, done) {
        	if (err) {
                	return console.error('error fetching client from pool', err);
                }
		client.query('INSERT INTO account (balance) VALUES (' + balance + ') RETURNING id', function(err, result) {
			callback(null, result.rows[0].id);
		});
	});
};

vows.describe('Given an account with balance of 11').addBatch({
	'when read the account balance': {
        	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, function(err, id) {
				account.find(id).balance(function(balance) {
					c(null, balance);
				});
			});
		},

        	'then balance equals 11': function (topic) {
        		assert.equal (topic, 11);
	        }
	}
}).addBatch({
	'when crediting 10 at the account balance': {
        	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, function(err, id) {
				account.find(id).transact(+10, function() {
					account.find(id).balance(function(balance) {
						c(null, balance);
					});
				});
			});
		},

		'then balance equals 21': function (topic) {
        		assert.equal (topic, 21);
		}
	}
}).addBatch({
	'when debting 10 at the account balance': {
        	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, function(err, id) {
				account.find(id).transact(-10, function() {
					account.find(id).balance(function(balance) {
						c(null, balance);
					});
				});
			});
		},

		'then balance equals 1': function (topic) {
			assert.equal (topic, 1);
		}
	}
}).addBatch({
	'when debting two transactions with value 8 in parallel at the account balance': {
        	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, function(err, id) {
				function debtOf8(callback) {
					account.find(id).transact(-8, function() { callback(); });
				}
				async.parallel([ debtOf8, debtOf8 ],
					function() {
						account.find(id).balance(function(balance) {
							c(null, balance);
						});
					}
				);
			});
		},

		'then balance equals 3': function (topic) {
        		assert.equal (topic, 3);
		}
	}
}).addBatch({
	'when there is lot of transactions in parallel for a long time': {
        	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, function(err, id) {
				function debtOf3(callback) {
					account.find(id).transact(-3, function() { callback(); });
				}
				var debtTransactions = [];
				for (var i = 0; i < 20; i++) {
					debtTransactions.push(debtOf3);
				}

				var begin = new Date().getTime();
				var afterTryBalance = 0;
				async.until(function() {
						var end = new Date().getTime();
						return afterTryBalance < 0 || (end - begin > 10000);
					}, function(callback) {
						async.parallel(debtTransactions,
							function() {
								account.find(id).balance(function(balance) {
									afterTryBalance = balance;
									callback();
								});
							}
						);
					}, function() {
						c(null, afterTryBalance);
				});
			});
		},

		'then balance is greater then 0': function (topic) {
        		assert.isTrue(topic >= 0);
		}
	}
}).export(module);

