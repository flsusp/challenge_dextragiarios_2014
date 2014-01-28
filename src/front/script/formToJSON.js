function formToJSON(selector) {
	var form = '';

	$(selector).find(':input[name][type!=checkbox][type!=radio]:enabled, :input[name][type=checkbox]:checked, select[name], :input[name][type=radio]:checked').each(function() {
		var input = $(this);
		var name = input.attr('name');
		var val = $.trim(encodeURIComponent(getValue(input)));

		if (val != '' && !input.data('exclude')) {
			form += name + "=" + val + "&";
		}
	});

	return form;
}

function contatosToJSON(selector){
	var contatos = [];
	var i = 0;
	$(selector).find("div.telefone").each(function() {
		var div = $(this);
		contatos[i] = {};
		contatos[i].telefone = div.find("input[name^='telefone']").val();
		contatos[i].ddd= div.find("input[name^='ddd']").val();
		contatos[i].ddi = div.find("input[name^='ddi']").val();
		contatos[i].tipoContato = div.find("select[name^='tipoContato']").val();
		contatos[i].email = div.find("input#email").val();

		i++;
	});
	return contatos;
}

function formToJSONObject(selector) {
	var json = {};
	$(selector).find(':input[name][type!=checkbox]:enabled, :input[name][type=checkbox]:checked, select[name], :input[name][type=radio]:checked').each(function() {
		var input = $(this);
		var name = input.attr('name');
		var val = $.trim(getValue(input));

		if (name != '' && val != '' && !input.data('exclude')) {
				json[name] = val;
		}
	});

	return json;
}

function getValue(self) {
	if (self.data('typeahead-id'))
		return self.data('typeahead-id');
	if (self.attr('alt') == "decimal" || self.data('type') == 'decimal')
		return self.val().replace(/\./g, '').replace(',', '.');

	if (self.attr('alt') == "integer")
		return self.val().replace(/\./g, '');

	return self.val();
}