$(function(){
	$.ajax("/templates/productsTemplate.txt", {
		method : 'GET',
		success : function(template) {
			var fnTemplate = doT.template(template);

			$.getJSON("/product/all", function(data) {
	    		$('#sub-content').append(fnTemplate(data));
	    		$('.product img').click(function(evt){
	    			showDetails(this.dataset['productId']);
	    		});
			});
		}
	});
});