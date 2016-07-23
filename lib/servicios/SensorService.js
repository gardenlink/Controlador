/*
 * SensorService
 * https://github.com/Botanicbot/App/lib/servicios/SensorService.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = SensorService.prototype;

var _logger;
var _DEBUG = true;

var async = require("async");
var _ = require("underscore");

var arduinoService; 

var Models = require("../dto/Sensor.js");
var ModelsDispositivo = require("../dto/Dispositivo.js");

var Arduino = require("../util/Arduino.js");
var arduino = new Arduino();



var lstSensores = [];
var lstDevices = [];


var dispositivos = [];
var sensores = [];

var _srv;
var _dataProvider; //No me gusta tener esto duplicado

 

/*
 * SensorService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que manejan los sensores
 * @dispositivos url configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */

function SensorService(dataProvider,srv,logger, callback) {
  	_srv = srv;
  	_dataProvider = dataProvider;
  	this._logger = logger;
	TraerDatos(dataProvider, function(error, data) {
		if (error) return callback(error, null);
		console.log("SensorService.Constructor : Finaliza Inicializacion de datos de SensorService");
		callback(null, data);
	});

}

function TraerDatos(dataProvider, cb) {
	
	dataProvider.Cache(true, function(error, data ) {
				dispositivos = data["Dispositivos"];
				sensores = data["Sensores"];
				cb(null,data);
			});
}



method.Refrescar = function(dataProvider, callback) {
	TraerDatos(dataProvider, callback);
};

method.BoardInfo = function (idDevice){
	
	  async.each(dispositivos, function(doc, cb) {
	  	
	  	if (idDevice == doc.Id) {
		  	doc.Servicio.boardInfo(doc.Id,  function(err, result){ 
		  		console.log(result);
		  	});
	  	}
	  }, function(error) { console.log("SensorService.BoardInfo : error : " + error) });
};

method.Leer = function(idDevice, idSensor, tipo, callback) {
 	if (_DEBUG)
 		console.log("SensorService.Leer() - Llamando servicio");
 	LlamarServicio(idDevice, idSensor, tipo, callback);
 
}


function LlamarServicio(idDevice, idSensor, accion, callback)
{
	 if (_DEBUG)
	 	console.log("SensorService.LlamarServicio : PARAMS : " + idDevice + idSensor + accion);
	 	
	 

	var params;
	 async.each(sensores, function(doc, cb) {
	  	if (doc.IdDispositivo == idDevice && doc.IdSensor == idSensor) {
	  	
	  		if (doc.Habilitado) {
	  		
	  		var topic = arduino.Dispositivos("Board") + doc.IdDispositivo + "/" + arduino.Dispositivos("Sensor") + idSensor;
	
  			switch(accion)
  			{
  				case "Temperatura":
  					params = arduino.Dispositivos("Sensor") + arduino.Operaciones("Sensor").Tempreatura + idSensor+doc.Pin+arduino.cmd_escape();
  					break;
  					
  				case "Humedad":
  					params = arduino.Dispositivos("Sensor")+arduino.Operaciones("Sensor").Humedad + idSensor+doc.Pin+arduino.cmd_escape();
  					break;
  				
  				case "Lluvia":
  					params = arduino.Dispositivos("Sensor")+arduino.Operaciones("Sensor").Lluvia + idSensor+doc.Pin+arduino.cmd_escape();
  					break;
  					
  				case "PH":
  					params = arduino.Dispositivos("Sensor")+arduino.Operaciones("Sensor").PH + idSensor+doc.Pin+arduino.cmd_escape();
  					break;
  					
  				case "EC":
  					params = arduino.Dispositivos("Sensor")+arduino.Operaciones("Sensor").EC + idSensor+doc.Pin+arduino.cmd_escape();
  					break;
  					
  				case "HumedadTierra":
  					params = arduino.Dispositivos("Sensor")+arduino.Operaciones("Sensor").HumedadTierra + idSensor+doc.Pin+arduino.cmd_escape();
  					break;
  			}
			if (_DEBUG)
	  			console.log("Sensor.LlamarServicio - Params: " + params);
	  		
	  		_srv.Leer(topic, function(error, data) {
  			 		if (error)
  			 			return callback(error, null);
  			 		
  			 		if (_DEBUG)
  			 			console.dir("SensorService.LlamarServicio -> Valor retornado por metodo Leer: " + data);
  			 			
  			 			//Guardo informacion en BD de mediciones
  			 			_dataProvider.Medicion().Save(arduino.TipoActuador("Sensor"), 
  			 										  doc.IdSensor, 
  			 										  doc.IdDispositivo, 
  			 										  data);
  			 			
  			 		return callback(null, data);
  			 	});
			  
         
  				
  			
			}
			else {
				console.log("SensorService.LlamarServicio : Intento de trabajar con sensor deshabilitado");
				return callback(new Error("SensorService.LlamarServicio : Intento de trabajar con sensor deshabilitado", null));
			}
	  	}
	  	//TODO : que pasa si no pasa el filtro?
	  	
	  }, function(error) { if (error) { 
	  			console.log("SensorService.LlamarServicio.LecturaAsyncSensores : error : " + error);
	  			return callback(error, null);
	  		} 
	  	 });

}

module.exports = SensorService;