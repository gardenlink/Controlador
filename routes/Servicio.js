module.exports = function(app, moment, dataProvider, serviceProvider, logger) {

var Medicion = require("../lib/dto/Medicion.js");
var objMedicion = new Medicion();

var Auxiliares = require('../lib/util/Auxiliares.js');
var helper = new Auxiliares();

var req = require('restler');
var async = require('async');
var _ = require('underscore');
var server = "localhost";
var port = 9000;


/* INICIO API REST */

var dispositivos = {};
var motores = {};
var relays = {};
var sensores = {};
var datos = {};

var _DEBUG = true;




app.get('/api/v1/servicio/consolidado', function(request, response, next){

		dataProvider.Cache(true, function(error, data ) {
				response.json(data);
			});
});

app.get('/api/v1/servicio/dispositivos', function(request, response, next){

		dataProvider.Cache(true, function(error, data ) {
				var result = data["Dispositivos"];
				response.json(result);
			});
});

app.get('/api/v1/servicio/dispositivos/:id', function(request, response, next){
		var id = request.params.id;
		dataProvider.Cache(true, function(error, data ) {
				var result = _.find(data.Dispositivos, function(element) {
					return element.Id == id;
				}); 
				response.json(result);
			});
});

app.get('/api/v1/servicio/relays', function(request, response, next){

		dataProvider.Cache(false, function(error, data ) {
				var result = data["Relays"];
				response.json(result);
			});
});

app.get('/api/v1/servicio/relays/:id', function(request, response, next){
		var id = request.params.id;
		
		
		dataProvider.Cache(true, function(error, data ) {
				var result = _.find(data.Relays, function(element) {
					 if (element.IdRelay == id)
					 	return element.IdRelay;
				}); 
				
				serviceProvider.Relay().Estado(result.IdDispositivo, result.IdRelay, function (error, doc) {
	      				if (error) {
	      					console.log("[GET] /api/relays/Error all lamar a servicio Arduino para consultar por el estado de Relays -> error :  ", error);
	      					return;
	      				}
	      				else {
							return response.json(doc);
	            		}
	      			}); 
				
			});
			
		
});

/*
app.get('/api/v1/servicio/sensores', function(request, response, next){

		var arrSensores = [];
		dataProvider.Cache(true, function(error, data ) {
			var result = data["Sensores"];
			
			async.each(data.Sensores, function (err,res) { 
			
				var resultMedicion = _.find(data.Mediciones, function(element) {
					 if (element.IdActuador == res.IdSensor)
					 	return element.IdRelay;
				});
				
				res.Mediciones = resultMedicion; 
				arrSensores.push(res);
			
			});
			
			response.json(arrSensores);
		});
				
});
*/
app.get('/api/v1/servicio/sensores/:id', function(request, response, next){
		var id = request.params.id;
			
		dataProvider.Cache(true, function(error, data ) {
			var result = _.find(data.Sensores, function (item) {
				return item.IdSensor == id;
			});
			if (result) {
				
				
				serviceProvider.Sensor().Leer(result.IdDispositivo, result.IdSensor, result.Tipo, function (error, doc) {
	      				if (error) {
	      					console.log("[GET] /api/v1/servicio/sensores/:id -> Error all lamar a servicio Arduino para Sensores -> error :  ", error);
	      					return;
	      				}
	      				else {
							return response.json(doc);
	            		}
	      			}); 
				
				/*
				//Obtengo detalle de sensor
				var url = "http://localhost:9000/api/sensores/" + result.IdSensor + "/mediciones?last=true&sorttype=TimeStamp&sortdirection=desc"
				req.get(url).on('complete', function(data) {
			    	result.UltimaMedicion = data;
					response.json(result);    	
			    }).on('error', function(error, response) { 
			    	console.log("Servicio -> Error: " + error);
			    	response.json(error);
			    });
			    */
			}
			else
			{
				response.json("");
			}
			
		});
});

app.get('/api/v1/servicio/sensores/:id/mediciones/grafico', function(request, response, next) {

	var  today = moment();
    yesterday = moment(today).add(-12, 'hours');

   var filter =  {TimeStamp: {
      $gte: yesterday.toDate(),
      $lt: today.toDate()},
      Id : request.params.id
    };

    //TODO: Implementar filtros en cache

});

app.get('/api/v1/servicio/motores', function(request, response, next){

		dataProvider.Cache(true, function(error, data ) {
				var result = data["Motores"];
				response.json(result);
			});
});

app.get('/api/v1/servicio/motores/:id', function(request, response, next){
		var id = request.params.id;
		dataProvider.Cache(true, function(error, data ) {
				var result = _.find(data.Motores, function(element) {
					return element.IdMotor == id;
				}); 
				response.json(result);
			});
});


/****
* Desde POSTMAN enviar sin comillas
* path = Activo
* valor = true, false
*/
app.patch('/api/v1/servicio/relays/:id', function(request, response,next) {
	var idRelay = request.params.id;
    var op = request.body.op; //solamente replace por ahora 
    var path = request.body.path; //debe venir sin comillas
    var valor = request.body.value;
    
	
    
    dataProvider.Cache(false, function(error, data ) {
    
    		if (error) { 
    			return;
    		}
    			
			var result = _.find(data.Relays, function (item) {
				return item.IdRelay == idRelay;
			});
		
			if (result) {
				
				data[path] = valor;
      		//Si el cambio es para activar o desactivar el RElay, llamo al servicio de Arduino
	      	if (path == "Activo") {
	      		var activo = helper.toBoolean(valor);
	      		
	      		
	      		if (_DEBUG)
	      			console.log("ServicioController: valor de variable Activo : " + activo);
	      		
	      		if (activo == true) {
	      			serviceProvider.Relay().Activar(result.IdDispositivo, result.IdRelay, function (error, doc) {
	      				if (error) {
	      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
	      					return;
	      				}
	      				else {
							return response.json(doc);
	            		}
	      			}); 
	      		}
	      		else if (activo == false)
	      		{
	      			
	      			serviceProvider.Relay().Desactivar(result.IdDispositivo, result.IdRelay, function (error, doc) {
	      				if (error) {
	      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
	      					return;
	      				}
	      				else {
	      						
								 return response.json(doc);
	            		}
	      			}); 
	      			
	      		}
	      		else {
	      			console.log("El valor del atributo Activo no es valido");
					return;
	      		}
			}
			else
			{
				console.log("hit 4");
				return;
			}
		}
		else
		{
			console.log("hit 5");
			return;
		}
	});

});


/****
* Desde POSTMAN enviar sin comillas
* path = Accion
* valor = AVANZAR, RETROCEDER, DETENER, ESTADO, POSICION
*/
app.patch('/api/v1/servicio/motores/:id', function(request, response,next) {
	var idMotor = request.params.id;
    var op = request.body.op; //solamente replace por ahora 
    var path = request.body.path; //debe venir sin comillas
    var valor = request.body.value;
    
	
    
    dataProvider.Cache(true, function(error, data ) {
    
    		if (error) { 
    			return;
    		}
    			
			var result = _.find(data.Motores, function (item) {
				return item.IdMotor == idMotor;
			});
		
			if (result) {
				
			data[path] = valor;
      		//Si el cambio es para activar o desactivar el RElay, llamo al servicio de Arduino
	      	if (path == "Accion") {
	      		//var activo = helper.toBoolean(valor);
	      		
	      		
	      		if (_DEBUG)
	      			console.log("ServicioController: valor de variable Accion : " + valor);
	      		
	      		switch (valor)
	      		{
	      			case "AVANZAR":
	      				console.log("llegacontroller");
			      		serviceProvider.Motor().Avanzar(result.IdDispositivo, result.IdMotor, function (error, doc) {
			      				if (error) {
			      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
			      					return;
			      				}
			      				else {
									return response.json(doc);
			            		}
			      			}); 
			      		
			      		break;
			      		
			      	case "RETROCEDER":
			      		serviceProvider.Motor().Retroceder(result.IdDispositivo, result.IdMotor, function (error, doc) {
			      				if (error) {
			      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
			      					return;
			      				}
			      				else {
									return response.json(doc);
			            		}
			      			}); 
			      		
			      		break;
			      		
			      	case "DETENER":
			      		serviceProvider.Motor().Detener(result.IdDispositivo, result.IdMotor, function (error, doc) {
			      				if (error) {
			      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
			      					return;
			      				}
			      				else {
									return response.json(doc);
			            		}
			      			}); 
			      		
			      		break;
			      		
			      	case "ESTADO":
			      		serviceProvider.Motor().Estado(result.IdDispositivo, result.IdMotor, function (error, doc) {
			      				if (error) {
			      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
			      					return;
			      				}
			      				else {
									return response.json(doc);
			            		}
			      			}); 
			      		
			      		break;
			      		
			      	case "POSICION":
			      		serviceProvider.Motor().Posicion(result.IdDispositivo, result.IdMotor, function (error, doc) {
			      				if (error) {
			      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
			      					return;
			      				}
			      				else {
									return response.json(doc);
			            		}
			      			}); 
			      		
			      		break;
			      		
			      	default:
						console.log("El valor del atributo Accion no es valido");
						return response.json("El valor del atributo Accion no es valido");
						break;

	      		}
	      		
			}
			else
			{
				console.log("El path no es accion");
				return response.json("El path no es accion");
			}
		}
		else
		{
			console.log("No llega resultado desde bd");
			return response.json("No llega resultado desde bd");
		}
	});

});

}