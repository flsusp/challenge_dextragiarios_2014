$(function(){
	$.ajax("/templates/productsTemplate.txt", {
		method : 'GET',
		success : function(template) {
			var fnTemplate = doT.template(template);

			$.getJSON("/product/all", function(data) {
	    		$('#main-content').append(fnTemplate(data));
	    		$('.product img').click(function(evt){
	    			var el = evt.toElement;
	    			console.log('img click', el);
	    			showDetails(el.dataset.productid);
	    		});
			});
		}
	});
});