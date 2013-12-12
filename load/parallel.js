var pg = require('pg');
var account = require("./../src/account");
var async = require('async');

async.parallel([
	function(callback) { account.find(1000).transact(7, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-2, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-3, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); },
	function(callback) { account.find(1000).transact(-1, callback); }
], function() {
	pg.end();
});
