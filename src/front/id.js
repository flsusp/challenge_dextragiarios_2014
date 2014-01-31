$(function(){

	if (sessionStorage.getItem("id") != null){
		document.getElementById("id").innerHTML = "Bem vindo, " + sessionStorage.getItem("id");
	}	
});