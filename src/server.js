var express = require('express');
var params = require('express-params')
var app = express();

params.extend(app);

function start(accountRepository) {
	app.param('id', /^\d+$/);

	app.get('/account/:id/balance', function(request, response) {
		accountRepository.find(request.params.id[0]).balance(function(balance) {
			response.send(200, 'Balance is ' + balance);
		});
	});

	console.log("Server has started.");
	app.listen(8080);
}

exports.start = start;
