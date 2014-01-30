var express = require('express');
var params = require('express-params')
var app = express();
var async = require('async');

params.extend(app);

function start(accountRepository, productRepository, port) {
	app.use(express.bodyParser());
	app.param('id', /^\d+$/);

	app.get('/account/:id/balance', function(request, response) {
		accountRepository.find(request.params.id[0]).balance(function(balance) {
			if (balance === null) {
				response.send(404);
			} else {
				response.send(200, 'Balance is ' + balance);
			}
		});
	});

	app.get('/teste', function(request, response) {
		var accountId = parseInt(request.params.id[0]);
		accountRepository.find(accountId).transact(parseInt(request.body.value), function(id) {
			response.writeHead(302, {
		  		'Location': '/transaction/' + id
			});
			response.send();
		});
	});

	app.get('/transaction/:id', function(request, response) {
		var transactionId = parseInt(request.params.id[0]);
		var tempo = new Date().getTime();
		while ((new Date().getTime() - tempo) < 1000) {}
		accountRepository.findTransfer(transactionId).getStatus(function(consolidada) {
			response.send(200, consolidada);
		});
	});

	app.post('/account/:id/transaction', function(request, response) {		
		var accountId = parseInt(request.params.id[0]);
		var conta = accountRepository.find(accountId);
		conta.transact(parseInt(request.body.value), function(id) {
			response.writeHead(302, {
		  		'Location': '/transaction/' + id
			});
			response.send();
			
			var consolida = [];
			consolida.push(conta.consolidar(function() {
				//callback
			}));
			async.parallel(consolida, function() {
				//callback
			});
		});

	});

	/*app.post('/account/:id/transaction', function(request, response) {		
		var accountId = parseInt(request.params.id[0]);
		accountRepository.find(accountId).transact(parseInt(request.body.value), function() {
			accountRepository.find(accountId).consolidar(function() {
				response.send(200, 'Transaction ok');
			});
		});
	});*/

	app.get('/product/:id/stock', function(request, response) {		
		productRepository.find(request.params.id[0]).stock(function(stock) {
			if (stock === null) {
				response.send(404);
			} else {
				response.send(200, 'Stock is ' + stock);
			}
		});
	});

	app.post('/product/:id/purchase', function(request, response) {
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
