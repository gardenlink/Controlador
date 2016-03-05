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

var ArestLibrary = require("./Arest.js");
var arduinoService; 

var Models = require("../dto/Sensor.js");
var ModelsDispositivo = require("../dto/Dispositivo.js");



var lstSensores = [];
var lstDevices = [];


var dispositivos = [];
var sensores = [];


 

/*
 * SensorService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que manejan los sensores
 * @dispositivos url configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */

function SensorService(dataProvider,logger, callback) {
  
  	this._logger = logger;
	TraerDatos(dataProvider, function(error, data) {
		console.log("Finaliza Inicializacion de datos de SensorService");
	});

}

function TraerDatos(dataProvider, callback) {
	
  
 async.series([
    function(callback){
        InitDevice(dataProvider, function(err, data) { 
        	callback(err, data);
        });
    }
    ,
     function(callback){
        InitSensor(dataProvider, function(err, data) { 
        	callback(err, data);
        });
        
    }
],
// optional callback
function(err, results){
    dispositivos = results[0];
    sensores = results[1];
    callback(err, results);
});
 	
}



function InitDevice (dataProvider, callback)
{
	lstDevices = [];
	 dataProvider.Device().GetAll(function (err, data){
  			if (err) {
  				console.log(err);
  				throw new Error(err);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado) {
			            var deviceModel = new ModelsDispositivo();
			            deviceModel.Crear(doc.Id, 
			            				  doc.Nombre, 
			            				  doc.Tipo, 
			            				  doc.Ip, 
			            				  doc.Puerto, 
			            				  doc.Habilitado, 
			            				  doc.Estado, 
			            				  doc.FrecuenciaMuestreo);
			        	var srv = new ArestLibrary(doc.Ip + ":" + doc.Puerto);
			            deviceModel.AddServicio(srv);
			            
			            if (!DeviceExists(lstDevices, deviceModel.Objeto()))
			            	lstDevices.push(deviceModel.Objeto());
			            	
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo GetAll() error : " + error); });
		     }
		     
		     callback(null, lstDevices); 
   		});
   		
}

function InitSensor(dataProvider, callback) {

	lstSensores = [];
  dataProvider.Sensor().GetAll(function (err, data){
  			if (err) {
  				console.log(err);
  				throw new Error(err);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado) {
			            var sensorModel = new Models();
			            sensorModel.Crear(doc.IdSensor,
			            				  doc.IdDispositivo, 
			            				  doc.Descripcion, 
			            				  doc.MarcaModelo, 
			            				  doc.Tipo, 
			            				  doc.Pin, 
			            				  doc.EsPinAnalogo,
			            				  doc.Habilitado);
			            
			            if (!SensorExists(lstSensores, sensorModel.Objeto()))
			            	lstSensores.push(sensorModel.Objeto());
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("Error al leer async la coleccion Sensor.GetAll() error : " + error); });
		     }
		     
		     callback (null, lstSensores);
   		});
}

function SensorExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	console.log(lst);
	async.each(lst, function(item , cb) {
	   		
   			 if (item) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("Error al leer async en metodo SensorExists error : " + error); retorno = false; });
	
	return retorno;
	
}

function DeviceExists(lst, value) {
	
	retorno = false;
	
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   			 
	   			 if (item && item.IdDispositivo && item.IdDispositivo == value) {
	   			 	retorno = true;
	   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("Error al leer async en mettodo DeviceExists() error : " + error); retorno = false; });
	return retorno;
}


method.Refrescar = function(dataProvider, callback) {
	TraerDatos(dataProvider, callback);
};

method.BoardInfo = function (idDevice){
	
	  async.each(dispositivos, function(doc, cb) {
	  	console.log(doc.Id);
	  	if (idDevice == doc.Id) {
		  	doc.Servicio.boardInfo(doc.Id,  function(err, result){ 
		  		console.log(result);
		  	});
	  	}
	  }, function(error) { console.log("error : " + error) });
};

method.GetTemperatura = function(idDevice, idSensor, callback) {
 async.each(dispositivos, function(doc, cb) {
	  	console.log("doc.ID : " + doc.Id + " -> idDevice : " + idDevice);
	  	if (doc.Id == idDevice)
	  	{
	  		doc.Servicio.callFunction("Temperatura", idSensor, function(err, data) {
	  			callback(err, data);
	  		});
	  	}
	  	
	  }, function(error) { console.log("SensorService.GetTemperatura() -> error : " + error) });
}; 

method.GetHumedad = function(idDevice, idSensor, callback) {
 async.each(dispositivos, function(doc, cb) {
	  	console.log(doc.Id);
	  	if (doc.Id == idDevice)
	  	{
	  		doc.Servicio.callFunction("Humedad", idSensor, function(err, data) {
	  			callback(null, data);
	  		});
	  	}
	  	
	  }, function(error) { console.log("error : " + error) });
};


method.LeerSensor = function(idDevice, idSensor, callback) {
  async.each(dispositivos, function(doc, cb) {
	  	if (doc.Id == idDevice) {
	  		async.each(sensores, function(result, callb) {
			  	
			  	if (result.IdDispositivo == idDevice && result.IdSensor == idSensor)
			  	{
			  		if (result.Habilitado) {
			  			if (result.EsPinAnalogo) {
			  				
			  				
			  				doc.Servicio.analogRead(result.Pin, function(error, data) {
			  					return callback(null, data);
			  				});
			  			} else { 
			  				doc.Servicio.digitalRead(result.Pin, function(error, data) {
			  					callback(null, data);
			  				});
			  			}
					}
					else {
						console.log("Intento de leer sensor deshabilitado");
					}
			  	}
			  	
			  }, function(error) { console.log("error : " + error) });
	  		
	  		
	  	}
	  }, function(error) { console.log("error : " + error) });
};


module.exports = SensorService;