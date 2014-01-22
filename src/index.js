var server = require("./server");
var account = require("./account");
var product = require("./product");

var arguments = process.argv.splice(2);

var port = 8080;
if (arguments[0])
	port = arguments[0];

server.start(account, product, port);
