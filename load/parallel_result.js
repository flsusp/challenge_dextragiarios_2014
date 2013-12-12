var pg = require('pg');
var account = require("./../src/account");

account.find(1000).balance(function(balance) {
	console.log(balance);
pg.end();
});
