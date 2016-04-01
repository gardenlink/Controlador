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
		if (error) return callback(error, null);
		console.log("SensorService.Constructor : Finaliza Inicializacion de datos de SensorService");
		callback(null, data);
	});

}

function TraerDatos(dataProvider, cb) {
	
  
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
    cb(err, results);
});
 	
}



function InitDevice (dataProvider, callback)
{
	lstDevices = [];
	 dataProvider.Device().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
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
		          }, function(error) { if (_DEBUG) console.log("SensorService.InitDevice : Error al leer async en mettodo GetAll() error : " + error); });
		     }
		     
		     return callback(null, lstDevices); 
   		});
   		
}

function InitSensor(dataProvider, callback) {

	lstSensores = [];
  dataProvider.Sensor().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
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
		          }, function(error) { if (_DEBUG) console.log("SensorService.InitSensor :  Error al leer async la coleccion Sensor.GetAll() error : " + error); });
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
	   			
	}, function(error) { if (_DEBUG) console.log("SensorService.SensorExists : Error al leer async en metodo SensorExists error : " + error); retorno = false; });
	
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
	   			
	}, function(error) { if (_DEBUG) console.log("SensorService.DeviceExists : Error al leer async en mettodo DeviceExists() error : " + error); retorno = false; });
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
	  }, function(error) { console.log("SensorService.BoardInfo : error : " + error) });
};

method.GetTemperatura = function(idDevice, idSensor, callback) {
 
 	LlamarServicio(idDevice, idSensor, "Temperatura", callback);
 
}

method.GetHumedad = function(idDevice, idSensor, callback) {
 
 	LlamarServicio(idDevice, idSensor, "Humedad", callback);
 	
};

method.LeerPin = function(idDevice, idSensor, callback)
{
	LlamarServicio(idDevice, idSensor, null, callback);
}


function LlamarServicio(idDevice, idSensor, funcion, callback)
{
	 async.each(dispositivos, function(doc, cb) {
	  	if (doc.Id == idDevice) {
	  		async.each(sensores, function(result, callb) {
			  	
			  	if (result.IdDispositivo == idDevice && result.IdSensor == idSensor)
			  	{
			  		if (result.Habilitado) {
			  			
			  			 
			  			if (funcion) {
			  				//Llamo a la funcion solicitada
			  				doc.Servicio.callFunction(funcion, idSensor, function(err, data) {
					  			callback(null, data);
					  		});
			  					
			  			}
			  			else
			  			{
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
					}
					else {
						console.log("SensorService.LlamarServicio : Intento de trabajar con sensor deshabilitado");
						return callback(new Error("SensorService.LlamarServicio : Intento de trabajar con sensor deshabilitado", null));
					}
			  	}
			  	
			  }, function(error) { console.log("SensorService.LlamarServicio.LecturaAsyncSensores : error : " + error) });
	  		
	  		
	  	}
	  }, function(error) { console.log("RelayService.LlamarServicio.LecturaAsyncDispositivos : error : " + error) });
}



/*
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
						console.log("SensorService.LeerSensor : Intento de leer sensor deshabilitado");
					}
			  	}
			  	
			  }, function(error) { console.log("SensorService.LeerSensor : error : " + error) });
	  		
	  		
	  	}
	  }, function(error) { console.log("SensorService.LeerSensor : error : " + error) });
};
*/

module.exports = SensorService;