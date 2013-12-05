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


vows.describe('Reading account balance').addBatch({
    'when account with balance 11 is created': {
        topic: function () {
		var c = this.callback;
		loadData.createAccountWithBalance(11, function(err, id) {
			account.find(id).balance(function(balance) {
				c(null, balance);
			});
		});
	},

        'then balance equal 11': function (topic) {
            assert.equal (topic, 11);
        }
    }
}).export(module);

