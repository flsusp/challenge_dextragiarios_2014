(function($) {

	i18n = {
		msgs : {},
		setMessages : function(_messages) {
			i18n.msgs = _messages;
		},
		get : function(key) {
			var msg = i18n.msgs[key];

			if (msg && (arguments.length > 1)) {
				for (var i = 1; i < arguments.length; i ++) {
					msg = msg.replace('{' + (i - 1) + '}', arguments[i]);
				}
			}
			return msg ? msg : '??? ' + key + ' ???';
		},
		getInt : function(key) {
			return parseInt(i18n.msgs[key]);
		}
	}

})(jQuery);