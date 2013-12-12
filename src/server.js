var express = require('express');
var params = require('express-params')
var app = express();

params.extend(app);

function start(accountRepository, port) {
	app.use(express.bodyParser());
	app.param('id', /^\d+$/);

	app.get('/account/:id/balance', function(request, response) {
		console.log('/account/' + request.params.id[0] + '/balance');
		accountRepository.find(request.params.id[0]).balance(function(balance) {
			if (balance === null) {
				response.send(404);
			} else {
				response.send(200, 'Balance is ' + balance);
			}
		});
	});

	app.post('/account/:id/transaction', function(request, response) {
		console.log('/account/' + request.params.id[0] + '/transaction');
		accountRepository.find(request.params.id[0]).transact(request.body.value, function() {
			response.send(200);
		});
	});

	console.log('Listenning to port ' + port);
	app.listen(port);
}

exports.start = start;
