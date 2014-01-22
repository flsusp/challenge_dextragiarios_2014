var pg = require('pg');

var conString = require("./../src/config").config().get('conString');

var account = require("./../src/account");

var vows = require('vows'),
	assert = require('assert'),
	async = require('async');

var loadData = {};
loadData.createAccountWithBalance = function (balance, callback) {
	pg.connect(conString, function(err, client, done) {
       	if (err) {
           	return console.log('error fetching client from pool', err);
        }
		client.query('INSERT INTO account (balance) VALUES (' + balance + ') RETURNING id', function(err, result) {
			done();
			callback(result.rows[0].id);
		});
	});
};

vows.describe('Given an account with balance of 11').addBatch({
	'when read the account balance': {
       	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, function(id) {
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
			loadData.createAccountWithBalance(11, function(id) {
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
			loadData.createAccountWithBalance(11, function(id) {
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
	'when debting 12 at the account balance': {
       	topic: function () {
			var c = this.callback;
			loadData.createAccountWithBalance(11, function(id) {
				account.find(id).transact(-12, function() {
					account.find(id).balance(function(balance) {
						c(null, balance);
					});
				});
			});
		},

		'then balance still equals 11': function (topic) {
        		assert.equal (topic, 11);
		}
	}
}).addBatch({
	'when crediting 10, one by one in parallel, at the account balance': {
       	topic: function () {
			var c = this.callback;

			loadData.createAccountWithBalance(11, function(id) {
				var functions = [];
				for (var i = 0; i < 10; i++) {
					functions.push(function(callback) {
						account.find(id).transact(1, function() {
							callback();
						});
					});
				}

				async.parallel(functions, function() {
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
}).export(module);
