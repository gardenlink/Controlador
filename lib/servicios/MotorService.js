
 /* MotorService
 * https://github.com/GardenLink
 * 
 * 2015 Diego Navarro M
 *
 */


var method = MotorService.prototype;


var _logger;
var debugMode = true;

var async = require("async");

var ArestLibrary = require("./Arest.js");
var arduinoService; 

var ModelsDispositivo = require("../dto/Dispositivo.js");
var Models = require("../dto/Motor.js");


var lstMotores = [];
var lstDevices = [];


var dispositivos = [];
var motores = [];




/*
 * MotorService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que activan y desactivan los motores
 * @webDuinoHost url configurado para webduino
 * @webDuinoPort {Number} puerto configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */
function MotorService(dataProvider,logger, callback) {
   
   	this._logger = logger;
	TraerDatos(dataProvider, function(error, data) {
		if (error) return callback(error, null);
		console.log("MotorService.Constructor : Finaliza Inicializacion de datos de MotorService");
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
        InitMotor(dataProvider, function(err, data) { 
        	callback(err, data);
        });
        
    }
],
// optional callback
function(err, results){
    dispositivos = results[0];
    motores = results[1];
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
		          }, function(error) { if (_DEBUG) console.log("MotorService.Inicializar : Error al leer async  error : " + error); });
		     }
		     
		     return callback(null, lstDevices); 
   		});
   		
}

function InitMotor(dataProvider, callback) {

	lstMotores = [];
  dataProvider.Motor().GetAll(function (err, data){
  			if (err) {
  				return callback(err, null);
  			}
  				
	   		if (data && data.length > 0)
	   		{
	   			 async.each(data, function(doc, cb) {
	   			 
	   			 	if (doc.Habilitado) {
	   			 	
			            var motorModel = new Models();
			            motorModel.Crear(doc.IdMotor,
			            				  doc.IdDispositivo, 
			            				  doc.Descripcion, 
			            				  doc.MarcaModelo, 
			            				  doc.Tipo, 
			            				  doc.Pin, 
			            				  doc.EsPinAnalogo,
			            				  doc.Habilitado,
			            				  doc.Posicion,
			            				  doc.Accion,
			            				  doc.Estado);
			            
			            if (!MotorExists(lstMotores, motorModel.Objeto()))
			            	lstMotores.push(motorModel.Objeto());
			            
		            }
		          }, function(error) { if (_DEBUG) console.log("MotorService.InitMotor : Error al leer async  error : " + error); });
		     }
		     
		     callback (null, lstMotores);
   		});
}

function MotorExists(lst, value) {
	
	var retorno = false;
	if (!lst || lst.length == 0)
	 return false;
	
	async.each(lst, function(item , cb) {
	   		
   			 if (item) {
   			 	retorno = true;
   			 }
	   			
	}, function(error) { if (_DEBUG) console.log("MotorService.MotorExists : Error al leer async en metodo MotorExists error : " + error); retorno = false; });
	
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
	   			
	}, function(error) { if (_DEBUG) console.log("MotorService.DeviceExists : Error al leer async en mettodo DeviceExists() error : " + error); retorno = false; });
	return retorno;
}

method.Refrescar = function(dataProvider, callback) {
	TraerDatos(dataProvider, callback);
};


method.Avanzar = function(idMotor,callback) {
  
    var objMotor = new MotorEntity();
    this.arduinoService.callFunction("Avanzar", "", function(data){
      objMotor.Crear(idMotor, idMotor, 0,0, data.return_value,0);
      callback(objMotor.Objeto());
    });
  
};

method.Retroceder = function(idMotor, callback)
{
   var objMotor = new MotorEntity();
   this.arduinoService.callFunction("Retroceder", idMotor, function(data){
       objMotor.Crear(idMotor, idMotor, 0,0, data.return_value,0);
       callback(objMotor.Objeto());
    });
};

method.Estado = function(idMotor, callback)
{
   var objMotor = new MotorEntity();
   this.arduinoService.callFunction("EstadoMotor", idMotor, function(data){
       objMotor.Crear(idMotor, idMotor, 0,0, data.return_value,0);
       callback(objMotor.Objeto());
    });
};

method.Posicion = function (idMotor, callback)
{
   var objMotor = new MotorEntity();
   this.arduinoService.callFunction("Posicion", idMotor, function(data){
       objMotor.Crear(idMotor, idMotor, 0,0, 0, data.return_value);
       callback(objMotor.Objeto());
    });
};



module.exports = MotorService;