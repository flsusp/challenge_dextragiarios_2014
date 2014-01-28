(function($) {
	index = {};

	index.comecar = function() {
		$.ajax({
			url : '/index',
			success : function(ret) {
				$('body').html(ret);
				/*$.holy('templates/pacote/pacoteInclusaoMenu.xml', {
					pacote : pacote
				});*/
			}
		});
	};

})(jQuery);