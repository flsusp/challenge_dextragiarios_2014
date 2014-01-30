var express = require('express');
var params = require('express-params')
var app = express();

params.extend(app);

function start(port) {
	app.use(express.bodyParser());
	app.param('id', /^\d+$/);
	//request.params.id[0]
	//request.body.value

	app.get('/', function(request, response) {
		
	});

	app.post('/', function(request, response) {		
		
	});

	console.log('Listenning to port ' + port);
	app.listen(port);
}

exports.start = start;
