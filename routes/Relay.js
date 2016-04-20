module.exports = function(app, moment, dataProvider, serviceProvider, logger) {

var Auxiliares = require('../lib/util/Auxiliares.js');
var helper = new Auxiliares();

var throwjs = require('throw.js');

var _DEBUG = true;

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();

var TipoDispositivo = "RELAY";

/* INICIO API REST */



app.get('/api/relays', function(request, response){
	 dataProvider.Relay().GetAll(function(err, data) { 
      if (data.length > 0) {
        response.json(data);
      }
      else
      {
      	response.json("");
      }
    });
});


app.get('/api/relays/:id', function (request, response) {
    var idRelay = request.params.id;

     var filter = {IdRelay : String};
    filter.IdRelay = idRelay;
    dataProvider.Relay().Find(filter, function(err, data) { 
      if (data) {
        response.send(data);
      }
      else
      {
      	response.send("");
      }
    });
});


app.post('/api/relays',function(request, response) {

    dataProvider.Relay().Save(request.body.IdRelay, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado,
    						   request.body.Activo,
    						   request.body.EsInverso
    						   );
    response.json("ok");

	
});

app.put('/api/relays/:id', function(request, response) {
	
	 dataProvider.Relay().Save(request.params.id, 
    						   request.body.IdDispositivo,
    						   request.body.Descripcion,
    						   request.body.MarcaModelo,
    						   request.body.Tipo,
    						   request.body.Pin,
    						   request.body.EsPinAnalogo,
    						   request.body.Habilitado,
    						   request.body.Activo,
    						   request.body.EsInverso
    						   );
    						   
    response.json("ok");
});

app.delete('/api/relays/:id', function(request, response){
	dataProvider.Relay().Delete(request.params.id);
	response.json("ok");
});

app.patch('/api/relays/:id', function(request, response) {
	var idRelay = request.params.id;
    var op = request.body.op; //solamente replace por ahora 
    var path = request.body.path; //debe venir sin comillas
    var valor = request.body.value;
    
	var filter = {IdRelay : String};
    filter.IdRelay = idRelay;
    dataProvider.Relay().Find(filter, function(err, data) { 
      if (data) {
      	//Campo modificado
      	data[path] = valor;
      	
      	//Si el cambio es para activar o desactivar el RElay, llamo al servicio de Arduino
      	if (path == "Activo") {
      		var activo = helper.toBoolean(valor);
      		
      		if (_DEBUG)
      			console.log("valor de variable Activo : " + activo);
      		
      		if (activo == true) {
      			serviceProvider.Relay().Activar(data.IdDispositivo, data.IdRelay, function (error, doc) {
      				if (error) {
      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
      					response.json({error : -1});
      					
      				}
      				else {
	      				dataProvider.Relay().Save(idRelay, 
	            				 data.IdDispositivo, 
	            				 data.Descripcion, 
	            				 data.MarcaModelo, 
	            				 data.Tipo, 
	            				 data.Pin, 
	            				 data.EsPinAnalogo,
	            				 data.Habilitado, 
	            				 data.Activo,
	            				 data.EsInverso);
	            				 
	            		response.json(data);
            		}
      			}); 
      		}
      		else if (activo == false)
      		{
      			serviceProvider.Relay().Desactivar(data.IdDispositivo, data.IdRelay, function (error, doc) {
      				if (error) {
      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
      					response.json(error);
      				}
      				else {
      					dataProvider.Relay().Save(idRelay, 
            				 data.IdDispositivo, 
            				 data.Descripcion, 
            				 data.MarcaModelo, 
            				 data.Tipo, 
            				 data.Pin, 
            				 data.EsPinAnalogo,
            				 data.Habilitado, 
            				 data.Activo,
            				 data.EsInverso);
            				 
            				 response.json(data);
            		}
      			}); 
      		}
      		else {
      			response.json("El valor del atributo Activo no es valido");
      		}
      		
      	}
      }
      else
      {
      	console.log("entra");
      	response.send("");
      }
    });
	
});

app.get('/api/relays/:id/mediciones', function(request, response){

	 var filter = {
	 			   IdTipoActuador : Number,
	 			   IdActuador : Number
	 			  };
	 			  
	 
	 filter.IdTipoActuador = objMedicion.GetTipoActuadorByName(TipoDispositivo);
	 filter.IdActuador = request.params.id;
	 
	 dataProvider.Medicion().GetCollection(filter, function(err, data) { 
	      if (err){
	      	response.json(err);
	      }
	      else
	      {
		      if (data.length > 0) {
		        response.json(data);
		      }
		  }
     });
     
});





};