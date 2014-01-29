$(function(){
	console.log('what?');
	$.ajax("/productsTemplate.xml", {
		method : 'GET',
		success : function(xml) {
			console.log('xml', xml);
			var fnTemplate = doT.template(xml);
			console.log('template', fnTemplate);

			$.getJSON("/product/all", function(data) {
	    		$('#main-content').append(fnTemplate(data));
			});
		}
	});
});
