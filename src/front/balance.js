$(function(){
	console.log('entrou');
	$.ajax("/templates/balanceTemplate.txt", {
		success : function(template) {
			var fnTemplate = doT.template(template);
			$.getJSON("/account/"+sessionStorage.getItem("id")+"/balance/", function(data) {
	    		$('.right-header-bottom').append(fnTemplate(data));	    		
			});
		}
	});
});