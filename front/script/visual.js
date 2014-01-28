$(document).ready(function(){
	$("#nav-wrapper").hide();
    $(window).scroll(function(){
        if($(window).scrollTop() >  $(".nav-header").outerHeight()) {
        	$("#nav-wrapper").slideDown();
        } else {
        	$("#nav-wrapper").slideUp();
        }
    });
    $("#topo-busca").focus(function() {
    	$("#topo-busca").value = "";
    });
})
