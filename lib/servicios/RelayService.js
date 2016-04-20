
 /* RelayService
 * https://github.com/GardenLink
 * 
 * 2015 Diego Navarro M
 *
 */


var method = RelayService.prototype;


var _logger;
var debugMode = true;

var async = require("async");

var ArestLibrary = require("./Arest.js");
var arduinoService; 

var ModelsDispositivo = require("../dto/Dispositivo.js");
var Models = require("../dto/Relay.js");


var lstRelays = [];
var lstDevices = [];


var dispositivos = [];
var relays = [];

var ANALOG_ON = 255;
var ANALOG_OFF = 0;

var DIGITAL_ON = 1;
var DIGITAL_OFF = 0;

var ACTIVAR = "Activar";
var DESACTIVAR = "Desactivar";
var CONSULTAR = "Consultar";

var ARDUINO_ACTIVAR = "A";
var ARDUINO_DESACTIVAR = "D";
var ARDUINO_CONSULTAR = "C";



/*
 * RelayService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que activan y desactivan los Reles
 * @webDuinoHost url configurado para webduino
 * @webDuinoPort {Number} puerto configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */
function RelayService(dataProvider,logger, callback) {
   
   	this._logger = logger;
	TraerDatos(dataProvider, function(error, data) {
		if (error) return callback(error, null);
		console.log("RelayService.Constructor : Finaliza Inicializacion de datos de RelayService");
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
        InitRelay(dataProvider, function(err, data) { 
        	callback(err, data);
        });
        
    }
],
// optional callback
function(err, results){
    dispositivos = results[0];
    relays = results[1];
    cb(err, results);
});
 	
}




function InitDevice (dataProvider, callback)
{
	lstDevices = [];
	 dataProvider.Device().GetAll(function (err, data){
  			if (err) {
  				console.log("RelayService.InitDevice.GetAll() -> error : " + err);
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado && doc.Estado) {
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
		          }, function(error) { if (error && _DEBUG) console.log("RelayService.Inicializar : Error al leer async  error : " + error); });
		     }
		     
		     return callback(null, lstDevices); 
   		});
   		
}

function InitRelay(dataProvider, callback) {

  lstRelays = [];
  dataProvider.Relay().GetAll(function (err, data){
  			if (err) {
  				console.log("RelayService.InitRelay.GetAll() -> error : " + err);
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
			            var relayModel = new Models();
			            relayModel.Crear(doc.IdRelay,
		            				  doc.IdDispositivo, 
		            				  doc.Descripcion, 
		            				  doc.MarcaModelo, 
		            				  doc.Tipo, 
		            				  doc.Pin,
		            				  doc.EsPinAnalogo,
		            				  doc.Habilitado,
		            				  doc.Activo,
		            				  doc.EsInverso);
			            
			            if (!RelayExists(lstRelays, relayModel.Objeto()))
			            	lstRelays.push(relayModel.Objeto());
			            
		          }, function(error) { if (_DEBUG) console.log("RelayService.InitMotor : Error al leer async  error : " + error); });
		     }
		     callback (null, lstRelays);
   		});
}

function RelayExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   		
   			 if (item) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("RelayService.MotorExists : Error al leer async en metodo MotorExists error : " + error); retorno = false; });
	
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
	   			
	}, function(error) { if (_DEBUG) console.log("RelayService.DeviceExists : Error al leer async en mettodo DeviceExists() error : " + error); retorno = false; });
	return retorno;
}

method.Refrescar = function(dataProvider, callback) {
	TraerDatos(dataProvider, callback);
};

method.Activar = function(idDevice, idRelay, callback) {
 	LlamarServicio(idDevice, idRelay, ACTIVAR, callback);
};

method.Desactivar = function(idDevice, idRelay, callback) {
 	LlamarServicio(idDevice, idRelay, DESACTIVAR, callback);
};

method.Estado = function(idDevice, idRelay, callback)
{
  	LlamarServicio(idDevice, idRelay, CONSULTAR, callback);
};

function LlamarServicio(idDevice, idRelay, accion, callback)
{
	 async.each(dispositivos, function(doc, cb) {
	  	if (doc.Id == idDevice) {
	  		async.each(relays, function(result, callb) {
			  	
			  	if (result.IdDispositivo == idDevice && result.IdRelay == idRelay)
			  	{
			  		if (result.Habilitado) {
			  			
			  			var relayModel = new Models();
			            relayModel.Crear(result.IdRelay,
		            				  result.IdDispositivo, 
		            				  result.Descripcion, 
		            				  result.MarcaModelo, 
		            				  result.Tipo, 
		            				  result.Pin,
		            				  result.EsPinAnalogo,
		            				  result.Habilitado,
		            				  result.Activo,
		            				  result.EsInverso);
			  			
			  			var params
			  			
			  			switch(accion)
			  			{
			  				case ACTIVAR:
			  					params = ARDUINO_ACTIVAR + idRelay;
			  					break;
			  					
			  				case DESACTIVAR:
			  					params = ARDUINO_DESACTIVAR + idRelay;
			  					break;
			  					
			  				case CONSULTAR:
			  					params = ARDUINO_CONSULTAR + idRelay;
			  					break;
			  			}
			  			
			  			console.log("Relay.LlamarServicio - Params: " + params);
			  			
			  			doc.Servicio.callFunction("Relay", params, function(error, data){
			  				
			  				//TODO: Mejorar esto
		  					if (error) {
		  						console.log("Relay.LlamarServicio - ERROR: " + error);
		  						return callback(error, null);
		  					}
		  					
		  					var activo;
		  					if (data == 1)
		  						activo = true;
		  					else if (data == 0)
		  						activo = false;
		  					else
		  						activo = false;
		  					
		  					 relayModel.Modificar(data.IdRelay,
		            				  data.IdDispositivo, 
		            				  data.Descripcion, 
		            				  data.MarcaModelo, 
		            				  data.Tipo, 
		            				  data.Pin,
		            				  data.EsPinAnalogo,
		            				  data.Habilitado,
		            				  activo,
		            				  data.EsInverso);
		            				  
		            		return callback(null, relayModel.Objeto());
		            		  
			  			});
			  			
					}
					else {
						console.log("RelayService.LlamarServicio : Intento de trabajar con relay deshabilitado");
						return callback(new Error("RelayService.LlamarServicio : Intento de trabajar con relay deshabilitado", null));
					}
			  	}
			  	
			  }, function(error) { if (error) console.log("RelayService.LlamarServicio.LecturaAsyncRelays : error : " + error) });
	  		
	  		
	  	}
	  }, function(error) { if (error) console.log("RelayService.LlamarServicio.LecturaAsyncDispositivos : error : " + error) });
}





module.exports = RelayService;