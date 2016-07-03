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

		dataProvider.Cache(true, function(error, data ) {
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
				response.json(result);
			});
});

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

app.get('/api/v1/servicio/sensores/:id', function(request, response, next){
		var id = request.params.id;
			
		dataProvider.Cache(true, function(error, data ) {
			var result = _.find(data.Sensores, function (item) {
				return item.IdSensor == id;
			});
			if (result) {
				
				//Obtengo detalle de sensor
				var url = "http://localhost:9000/api/sensores/" + result.IdSensor + "/mediciones?last=true&sorttype=TimeStamp&sortdirection=desc"
				req.get(url).on('complete', function(data) {
			    	result.UltimaMedicion = data;
					response.json(result);    	
			    }).on('error', function(error, response) { 
			    	console.log("Servicio -> Error: " + error);
			    	response.json(error);
			    });
			}
			else
			{
				result.UltimaMedicion = null;
				response.json(result);
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


app.patch('/api/v1/servicio/relays/:id', function(request, response) {
	var idRelay = request.params.id;
    var op = request.body.op; //solamente replace por ahora 
    var path = request.body.path; //debe venir sin comillas
    var valor = request.body.value;
    
	
    
    dataProvider.Cache(true, function(error, data ) {
			var result = _.find(data.Relays, function (item) {
				return item.IdRelay == idRelay;
			});
		
			if (result) {
				
				data[path] = valor;
      	//Si el cambio es para activar o desactivar el RElay, llamo al servicio de Arduino
	      	if (path == "Activo") {
	      		var activo = helper.toBoolean(valor);
	      		
	      		
	      		if (_DEBUG)
	      			console.log("valor de variable Activo : " + activo);
	      		
	      		if (activo == true) {
	      			serviceProvider.Relay().Activar(result.IdDispositivo, result.IdRelay, function (error, doc) {
	      				if (error) {
	      					console.log("[PATCH] /api/relays/Error all lamar a servicio Arduino para Relays -> error :  ", error);
	      					
	      					return;
	      				}
	      				else {
		            		
							console.dir(doc);			            		
		            		
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
								 console.dir(doc);			  
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
				
			}
		}
	});
    
	response.json("OK");




});
}