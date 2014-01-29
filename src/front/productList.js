$(function(){
	console.log('what?');
	$.ajax("/productsTemplate.txt", {
		method : 'GET',
		success : function(template) {
			console.log('template', template);
			var fnTemplate = doT.template(template);
			console.log('fnTemplate', fnTemplate);

			$.getJSON("/product/all", function(data) {
	    		$('#main-content').append(fnTemplate(data));
			});
		}
	});
});
