
showDetails = function(id) {
	console.info(id);
	$.ajax("/templates/detailsTemplate.txt", {
		method : 'GET',
		success : function(template) {
			var fnTemplate = doT.template(template);

			$.getJSON("/product/"+id, function(data) {
	    		$('#sub-content').html(fnTemplate(data));
			});
		}
	});
}