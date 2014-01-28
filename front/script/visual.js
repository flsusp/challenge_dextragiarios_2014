$(document).ready(function(){
	$("#nav").hide();
    $(window).scroll(function(){
        if($(window).scrollTop() >  $(".nav-header").outerHeight()) {
        	$("#nav").slideDown();
        } else {
        	$("#nav").slideUp();
        }
    })
})
