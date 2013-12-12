var call = require("./../src/callback").call;
var vows = require('vows');
var assert = require('assert');

vows.describe('Given a function callback').addBatch({
	'when calling with parameters': {
       	topic: function () {
			call(this.callback, null, 1);
		},

    	'then parameter is 1': function (topic) {
    		assert.equal (topic, 1);
        }
	}
}).export(module);
