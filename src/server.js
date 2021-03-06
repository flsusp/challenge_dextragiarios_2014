var express = require('express');
var params = require('express-params')
var app = express();
var fs = require('fs');
var path = require('path');
var async = require('async');

params.extend(app);

function returnJSON(json, response) {
	if (json === null) {
		response.send(404);
	} else {
		response.writeHeader(200, {"Content-Type": "application/json"});  
		response.write(JSON.stringify(json));
		response.end();
	}
}

function start(accountRepository, productRepository, port) {
	app.use(express.bodyParser());
	app.param('id', /^\d+$/);
	app.param('accountId', /^\d+$/);
	app.param('quantidade', /^\d+$/);
	app.use(express.static(path.join(__dirname, 'front')));

	app.get('/account/:id/balance', function(request, response) {
		accountRepository.find(request.params.id[0]).balance(function(balance) {
			returnJSON({balance : balance}, response);
		});
	});

	app.get('/index', function(request, response) {
		fs.readFile(__dirname + '/index.htm', 
			function (err, html) {
			    if (err) {
			    	console.log('erro');
			        //throw err; 
			        return;
			    }
			    response.writeHeader(200, {"Content-Type": "text/html"});  
			    response.write(html);  
			    response.end();  
		});
	});

	//exibe a lista de produtos
	app.get('/product', function(request, response) {
		fs.readFile(__dirname + '/product.htm', 
			function (err, html) {
			    if (err) {
			    	console.log('erro');
			        //throw err; 
			        return;
			    }
			    response.writeHeader(200, {"Content-Type": "text/html"});  
			    response.write(html);  
			    response.end();  
		});
	});

	//retorna o JSon
	app.get('/product/all', function(request, response) {
	    productRepository.allProducts(function (result) {
	    	returnJSON(result, response);
    	});
	});

	app.get('/product/:id', function(request, response) {
	    productRepository.getProduct(parseInt(request.params.id[0]), function (result) {
    		response.writeHeader(200, {"Content-Type": "application/json"});  
      		response.write(JSON.stringify(result));
			response.end();  
    	});	
	});


	app.get('/account/:id', function(request, response) {
            console.log('/account/' + request.params.id[0]);
            accountRepository.validaLogin((parseInt(request.params.id[0])), function(result) {
                    response.writeHeader(200, {"Content-Type": "application/json"});  
                    response.write(JSON.stringify(result));
                    response.end();
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
			consolida.push(conta.consolidar({ productId : id }));
			async.parallel(consolida, function() {
				//callback
			});
		});
	});


	app.get('/product/:id/stock', function(request, response) {		
		productRepository.find(request.params.id[0]).stock(function(stock) {
			if (stock === null) {
				response.send(404);
			} else {
				response.send(200, 'Stock is ' + stock);
			}
		});
	});

	app.get('/product/:id/add/:quantidade', function(request, response) {		
		var quantidade = request.params.quantidade[0];
		productRepository.find(request.params.id[0]).add(quantidade, function() {
			response.send(200);
		});
	});

	app.post('/product/:id/purchase', function(request, response) {
		console.log('/product/' + request.params.id[0] + '/purchase');
		var product = productRepository.find(request.params.id[0]);
		var conta = accountRepository.find(request.body.accountId);
		product.purchase(parseInt(request.body.accountId), request.body.quantity, function(status, id) {
			console.log('/stock/' + id + '/' + request.body.accountId);
			response.writeHead(302, {
		  		'Location': '/stock/' + id + '/' + request.body.accountId
			});
			response.send();
			
			var consolida = [];
			consolida.push(product.consolidar(function() {
				
			}));
			async.parallel(consolida, function() {
				//callback
			});
		});
	});

	app.get('/stock/:id/:accountId', function(request, response) {
		var stockId = parseInt(request.params.id[0]);
		var tempo = new Date().getTime();
		var conta = accountRepository.find(request.params.accountId[0]);
		while ((new Date().getTime() - tempo) < 1000) {}
		productRepository.findStock(stockId).getStatus(function(consolidada) {
			console.log('consolidade_;', consolidada, 'idd', request.params.accountId[0]);
			if (consolidada) {
				var consolida = [];
				consolida.push(conta.consolidar());
				async.parallel(consolida, function() {
					//callback
				});
			}
			response.send(200, consolidada);
		});
	});

	console.log('Listenning to port ' + port);
	app.listen(port);
}

exports.start = start;
