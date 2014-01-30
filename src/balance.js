$(function(){
	$.ajax("/templates/balanceTemplate.txt", {
		type : 'GET',
		success : function(template) {
			var fnTemplate = doT.template(template);
			var url = "/account/"+sessionStorage.getItem("id")+"/balance/";
			console.log("url" , url);
			$.getJSON(url, function(data) {
				console.log('oi');
	    		$('right-header-bottom').append(fnTemplate(data));	    		
			});
		}
	});
});