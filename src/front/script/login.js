//id 
function login() {
	var id = document.getElementById("txtId").value;
	document.getElementById("idUser").value = id;

	$.getJSON("/account/"+id, function(data) {
		if (data == null) {
			alert("Usuario invalido!");
		}
		else {
			sessionStorage.setItem('id', id);
			window.location.href = "/product";
		}
	});	
}

