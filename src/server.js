var http = require('http');
var qs = require('querystring');

function start(accountRepository) {
	function onRequest(request, response) {
		var path = require('url').parse(request.url).pathname;
		var pathParts = path.split(require('path').sep);

		if (request.method == 'POST') {
			if (path.length != 3) {
				response.statusCode = 400;
				response.end();
				return;
			}

			var accountId = parseLong(path[1]);
			var operation = path[2];

			var body = '';
			request.on('data', function (data) {
				body += data;
				// 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
				if (body.length > 1e6) {
					// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
					request.connection.destroy();
				}
			});
			request.on('end', function () {
				var postParameters = qs.parse(body);
				var account = accountRepository.find(accountId);
				if ('debit' == operation) {
					account.debit(postParameters.value);
				} else {
					account.credit(postParameters.value);
				}
				account.balance(function(balance) {
					response.writeHead(200, {'Content-Type': 'text/plain'});
					response.write(balance);
					response.end();		
				});
			});
		} else if (request.method == 'GET') {
			if (path.length != 2) {
				response.statusCode = 400;
				response.end();
				return;
			}

			var accountId = parseLong(path[1]);
			var account = accountRepository.find(accountId);
			account.balance(function(balance) {
				response.writeHead(200, {'Content-Type': 'text/plain'});
				response.write(balance);
				response.end();		
			});
		} else {
			if (path.length != 2) {
				response.statusCode = 400;
				response.end();
				return;
			}
		}
	}

	http.createServer(onRequest).listen(8888);
	console.log("Server has started.");
}

exports.start = start;
