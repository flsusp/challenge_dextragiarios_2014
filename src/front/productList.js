$(function(){
	$.getJSON(
    	"/product/all", function(data){
    		$.each(data, function(i,item){
    			$("#main-content").append( 
    				'<div class="product">'
						+ '<img src="/resources/images/' + item.url + '"> '
						+ '<br>'+ item.name
						+ '<br><a class="imageLink" href="/product/'+ item.id +'/purchase"></a>'
					+ '</div>'
   				);
   				console.log("item:",item);
    		});
	});
});