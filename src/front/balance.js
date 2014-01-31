$(function(){
	console.log('entrou');
	$.ajax("/templates/balanceTemplate.txt", {
		success : function(template) {
			var fnTemplate = doT.template(template);
			$.getJSON("/account/"+sessionStorage.getItem("id")+"/balance/", function(data) {
	    		$('.balance-nav').append(fnTemplate(data));
	    		$('.right-header-bottom').append(fnTemplate(data));
			});
		}
	});
});