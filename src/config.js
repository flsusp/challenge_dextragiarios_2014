function config() {
	var nconf = require('nconf');
	nconf = nconf.env()
				.file('./../base_config.json')
				.file('/home/' + nconf.env().get('USER') + '/.dextragiarios_config.json');
	return nconf;
}

exports.config = config;
