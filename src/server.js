var express = require('express');
var params = require('express-params')
var app = express();

params.extend(app);

function start(accountRepository, productRepository, port) {
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
		accountRepository.find(parseInt(request.params.id[0])).transact(parseInt(request.body.value), function() {
			response.send(200, 'Transaction ok');
		});
	});

	app.get('/product/:id/stock', function(request, response) {
		console.log('/product/' + request.params.id[0] + '/stock');
		productRepository.find(request.params.id[0]).stock(function(stock) {
			if (stock === null) {
				response.send(404);
			} else {
				response.send(200, 'Stock is ' + stock);
			}
		});
	});

	app.post('/product/:id/purchase', function(request, response) {
		console.log('/product/' + request.params.id[0] + '/purchase');
		productRepository.find(request.params.id[0]).purchase(request.body.accountId, 1, function(status) {
			if (status == 'success') {
				response.send(200, status);
			}
			response.send(500);
		});
	});

	console.log('Listenning to port ' + port);
	app.listen(port);
}

exports.start = start;
