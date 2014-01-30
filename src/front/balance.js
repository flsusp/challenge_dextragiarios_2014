$(function(){
	console.log('entrou');
	$.ajax("/templates/balanceTemplate.txt", {
		success : function(template) {
			var fnTemplate = doT.template(template);
			$.getJSON("/account/"+sessionStorage.getItem("id")+"/balance/", function(data) {
				console.log('id: '+data);
	    		$('.right-header-top').append(fnTemplate(data));	    		
			});
		}
	});
});