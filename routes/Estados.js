module.exports = function(app, logger) {


var Estado = require("../lib/dto/Estado.js");
var async = require("async");
var Auxiliares = require('../lib/util/Auxiliares.js');
var helper = new Auxiliares();
var lstEstado = [];


function init()
{
	lstEstado = [];
	if (lstEstado.length == 0) {
		var objEstado1 = new Estado();
		objEstado1.AddEstado(false);
		lstEstado.push(objEstado1.Objeto());
		var objEstado2 = new Estado();
		objEstado2.AddEstado(true);
		lstEstado.push(objEstado2.	Objeto());
	}
	
	return lstEstado;
}

app.get('/api/estados', function(request, response) {
	var res = init();
	response.send(res);
});

app.get('/api/estados/:id', function(request, response) {
	init();
	var respuesta;
	 async.each(init(), function(doc, cb) {
	   			 	if (doc.Estado == helper.toBoolean(request.params.id)) {
			            respuesta = doc;
		            }
		          }, function(error) { console.log("/api/estados/:id -> Error al leer async, error : " + error); });

	response.send(respuesta);
});









};