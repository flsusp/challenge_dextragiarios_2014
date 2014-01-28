//id 
function login() {
	var id = document.getElementById("txtId").value;
	document.getElementById("idUser").value = id;

	//alert(document.getElementById("idUser").value);

	sessionStorage.setItem('id', id);

	window.location.href = "/product";
}

