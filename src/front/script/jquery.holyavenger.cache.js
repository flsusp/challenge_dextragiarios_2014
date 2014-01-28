(function($) {
	$.holyavenger.cache = {
		supportsStorage : function() {
			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch (e) {
				return false;
			}
		},
		store : function(doc, url) {
			try {
				var docStr = $.holyavenger.readText(doc, true);
				localStorage[url] = docStr;
				return true
			} catch (e) {
				return false;
			}
		},
		get : function(url) {
			try {
				return localStorage[url];
			} catch (e) {
				return null;
			}
		},
		isCacheable : function(doc) {
			return $(doc).find('engine').attr('cacheable') == 'true';
		},
		clear : function() {
			if ($.holyavenger.cache.supportsStorage()) {
				localStorage.clear();
			}
		},
		enabled : true
	};

	if ($.holyavenger.cache.supportsStorage()) {
		$.ajaxPrefilter(function(options, originalOpts, jqXHR) {
			var dataType = originalOpts.dataType;
			if ($.holyavenger.cache.enabled && dataType && (dataType === 'holy' || dataType === 'holyavenger')) {
				var url = options.url;
				var cached = $.holyavenger.cache.get(url);
				if (cached) {
					jqXHR.abort();
					var cacheContext = options.context ? options.context : options;
					$.holyavenger.parseEngine(cached, cacheContext);
					if (options.cacheSuccess) {
						var cacheCallback = $.proxy(options.cacheSuccess, cacheContext);
						cacheCallback(cached, cacheContext, url);
					}
					if (options.success) {
						options.success();
					}
				} else {
					var callback = options.success;
					var holyCacheCallback = function(doc) {
						if ($.holyavenger.cache.isCacheable(doc)) {
							$.holyavenger.cache.store(doc, url);
						}
						var context = this;
						if (callback) {
							callback = $.proxy(callback, context);
							callback(arguments);
						}
					};
					options.success = holyCacheCallback;
				}
			}
		});
	}
})(jQuery);