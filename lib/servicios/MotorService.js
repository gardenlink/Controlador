/*
 * BombaService
 * https://github.com/Botanicbot/App/Temporizador.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = MotorService.prototype;


var _logger;
var debugMode = true;

var ArestLibrary = require("../Arduino/Arest.js");
var arduinoService; 

var MotorEntity = require("../dto/Motor.js");


/*
 * MotorService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que activan y desactivan las bombas
 * @webDuinoHost url configurado para webduino
 * @webDuinoPort {Number} puerto configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */
function MotorService(dispositivos,logger) {
   
	this._logger = logger;
  this.arduinoService = new ArestLibrary(dispositivos.ip + ':' + dispositivos.puerto);

/*
  dispositivo = null;


  for(var dev in dispositivos)
  {
    if (dispositivos[dev].id == ID_ARDUINO) 
    {
      if (dispositivos[dev].habilitado == "true" || dispositivos[dev].habilitado == "TRUE")
      {
        if (dispositivos[dev].tipo == TIPO_TARJETA) {
          dispositivo = dispositivos[dev];
          
        }
        else
        {
          console.log("El dispositivo configurado con ID : " + ID_ARDUINO + " tiene un tipo de tarjeta diferente al configurado");
          break;
        }
      }
      else
      {
        console.log("El dispositivo configurado con ID : " + ID_ARDUINO + " esta deshabilitado por config");
        break;
      }
    }
  }


  if (!dispositivo) {
    console.log("BombaService: Dispositivo no encontrado..");
    //throw new Error("BombaService: Dispositivo no encontrado..");
  }
  */
}




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