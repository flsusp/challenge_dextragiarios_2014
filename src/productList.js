var pg = require('pg'); 
var nconf = require('nconf');

var integration = require("./integration")
var account = require("./account")

var conString = require("./config").config().get('conString');
var call = require("./callback").call;

var client = new pg.Client(conString);


var list = function(callback) {
		pg.connect(conString, function(err, client, done) {
			if (err) {
				throw err;
			}
			client.query('SELECT * FROM product', function(err, result) {
				done();
				if (err) {
		           	return console.log('error ', err);
				}
				console.log("entrou" + result);
				// if (result.rows.length == 0) {
				// 	call(callback, null);
				// } else {
				// 	call(callback, result.rows[0]);
				// }
				return result;

			});
		});
	}

// .getJSON(
// 	"teste.js", function(data){
// 		$('#nome').text(data.nome);
// 		$('#perfil').text(data.perfil);
// 		$('#horario').text(data.horario);
// 	}
// );