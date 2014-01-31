$(function(){
	console.log('entrou');
	$.ajax("/templates/balanceNavTemplate.txt", {
		success : function(template) {
			var fnTemplate = doT.template(template);
			$.getJSON("/account/"+sessionStorage.getItem("id")+"/balance/", function(data) {
	    		$('.balance-nav').append(fnTemplate(data));
			});
		}
	});
});