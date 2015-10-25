/*
 * BombaService
 * https://github.com/Botanicbot/App/Temporizador.js
 * 
 * 2015 Diego Navarro M
 *
 */


var method = BombaService.prototype;
var Tarjeta = require('../Arduino/Arduino.js');

var TIPO_TARJETA = "UNO";
var ID_ARDUINO = 001;
var arduino = new Tarjeta(TIPO_TARJETA);

var _logger;
var debugMode = true;

var ArestLibrary = require("../Arduino/Arest.js");
var arduinoService; 

var BombaEntity = require("../dto/Bomba.js");

var dispositivo;




//variables para mapeo de dispositivos con Arduino
var BOMBA =
{
  1 : arduino.Board().ANALOG_PIN[0],
  2 : arduino.Board().ANALOG_PIN[1],
  3 : arduino.Board().ANALOG_PIN[2],
  4 : arduino.Board().ANALOG_PIN[3]
}

var ESTADO_BOMBA =
{
  'ON' : arduino.Board().ANALOG_PIN_STATE['ON'],
  'OFF' : arduino.Board().ANALOG_PIN_STATE['OFF']
}



/*
 * BombaService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que activan y desactivan las bombas
 * @webDuinoHost url configurado para webduino
 * @webDuinoPort {Number} puerto configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */
function BombaService(dispositivos,logger) {
   
	this._logger = logger;
  dispositivo = null;
  for(var dev in dispositivos)
  {
    if (dispositivos[dev].id == ID_ARDUINO) 
    {
      if (dispositivos[dev].habilitado == "true" || dispositivos[dev].habilitado == "TRUE")
      {
        if (dispositivos[dev].tipo == TIPO_TARJETA) {
          dispositivo = dispositivos[dev];
          break;
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
    throw new Error("BombaService: Dispositivo no encontrado..");
  }
  
  
  this.arduinoService = new ArestLibrary(dispositivo.ip + ':' + dispositivo.puerto);
}


method.GetEstadoBomba = function(idBomba, callback) {
  var err = VerificarPin(idBomba, 'analogo');
  if (!err)
  {
    var objBomba = new BombaEntity();
    this.arduinoService.analogRead(BOMBA[idBomba], function(data) {
      objBomba.Crear(idBomba, BOMBA[idBomba], 0,0, data.return_value);
      callback(objBomba.Objeto());  
    });
  }
  else{
    callback(new Error(err));
  }
    
};

method.ActivarBomba = function(idBomba,callback) {
  var err = VerificarPin(idBomba, 'analogo');
  if (!err)
  {
    var objBomba = new BombaEntity();
    this.arduinoService.analogWrite(BOMBA[idBomba], ESTADO_BOMBA['ON'], function(data) {
      objBomba.Crear(idBomba, BOMBA[idBomba],0, 0, data.return_value);
      callback(objBomba.Objeto());  
    });
  }
  else {
    callback(new Error(err));
  }

};

method.DesactivarBomba = function(idBomba,callback) {
  var err = VerificarPin(idBomba, 'analogo');
  if (!err)
  {
    var objBomba = new BombaEntity();
    this.arduinoService.analogWrite(BOMBA[idBomba], ESTADO_BOMBA['OFF'], function(data) {
      objBomba.Crear(idBomba, BOMBA[idBomba], 0,0, data.return_value);
      callback(objBomba.Objeto());  
    });
  }
  else {
    callback(new Error(err));
  }
};

function VerificarPin(pin, modo)
{  
  if (modo == 'analogo')
  {
    if (!BOMBA[pin]) {
      return "El pin no esta disponible para ser ocupado como sensor analogo";
    }
  }
  else
  {
    return "El pin no esta disponible para ser ocupado como sensor analogo";
  }
  return null;
}



module.exports = BombaService;