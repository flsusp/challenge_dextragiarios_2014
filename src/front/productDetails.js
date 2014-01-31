
showDetails = function(id) {
	$.ajax("/templates/detailsTemplate.txt", {
		success : function(template) {
			var fnTemplate = doT.template(template);
			$.getJSON("/product/"+id, function(data) {
	    		$('#sub-content').html(fnTemplate(data));
	    		$('input.comprar').click(function () {
	    		var qtd = $('input:text[name=qtd]').val();
	    			$.ajax("/product/"+id+"/purchase", {
	    				type: "POST", 
	    				data: { accountId: sessionStorage.getItem("id"), quantity: qtd}
	    			})
	    			.done(function(msg) {
    					alert("Produto comprado! " + msg);
  					})
  					.fail(function(msg) {
  						alert('Parece que você não tem crédito ):');
  					});
	    		});
			});
		}
	});
}