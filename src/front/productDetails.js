
showDetails = function(id) {
	$.ajax("/templates/detailsTemplate.txt", {
		method : 'GET',
		success : function(template) {
			var fnTemplate = doT.template(template);

			$.getJSON("/product/"+id, function(data) {
	    		$('#main-content').append(fnTemplate(data));
			});
		}
	});
}