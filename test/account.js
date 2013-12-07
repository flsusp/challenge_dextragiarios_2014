var pg = require('pg');
var conString = "postgres://challenge_user:123mudar@localhost/challenge";

var account = require("./../src/account");

var vows = require('vows'),
assert = require('assert');

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
}).export(module);

