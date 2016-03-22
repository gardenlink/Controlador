/*
 * SensorService
 * https://github.com/GardenLink
 * 
 * 2015 Diego Navarro M
 *
 */


var method = SensorService.prototype;
var Tarjeta = require('../Arduino/Arduino.js');

var TIPO_TARJETA = "UNO";
var ID_ARDUINO = 001;
var arduino = new Tarjeta(TIPO_TARJETA);

var _logger;
var debugMode = true;

var ArestLibrary = require("./Arest.js");
var arduinoService; 

var SensorEntity = require("../dto/Sensor.js");


var dispositivo;

//variables para mapeo de dispositivos con Arduino
var SENSOR_ANALOGO =
{
  5 : arduino.Board().ANALOG_PIN[4] //el unico disponible, los otros estan ocupados con los rele de las bombas
}

var SENSOR_DIGITAL =
{
  1 : arduino.Board().DIGITAL_PIN[1],
  2 : arduino.Board().DIGITAL_PIN[2],
  3 : arduino.Board().DIGITAL_PIN[3],
  4 : arduino.Board().DIGITAL_PIN[4],
  5 : arduino.Board().DIGITAL_PIN[5],
  6 : arduino.Board().DIGITAL_PIN[6],
  7 : arduino.Board().DIGITAL_PIN[7],
  8 : arduino.Board().DIGITAL_PIN[8],
  9 : arduino.Board().DIGITAL_PIN[9]
}

var ESTADO_SENSOR_ANALOGO =
{
  'ON' : arduino.Board().ANALOG_PIN_STATE['ON'],
  'OFF' : arduino.Board().ANALOG_PIN_STATE['OFF']
}

var ESTADO_SENSOR_DIGITAL =
{
  'ON' : arduino.Board().DIGITAL_PIN_STATE['ON'],
  'OFF' : arduino.Board().DIGITAL_PIN_STATE['OFF']
}

var MODO_SENSOR =
{
   'IN' : 'INPUT',
   'OUT' : 'OUTPUT'
}


 

/*
 * SensorService
 * @constructor
 *
 * @description Inicializa y Configura los servicios que manejan los sensores
 * @dispositivos url configurado para webduino
 * @logger {object} objeto para registrar logs
 *
 */

function SensorService(dispositivos,logger) {
   
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
    console.log("SensorService: Dispositivo no encontrado..");
    throw new Error("SensorService: Dispositivo no encontrado..");
  }
  
  
  this.arduinoService = new ArestLibrary(dispositivo.ip + ':' + dispositivo.puerto);
}

//Usamos DHT 11 para leer temperatura y humedad
method.GetTemperatura = function(pin, callback) {
  var objSensor = new SensorEntity();
  this.arduinoService.callFunction("Temperatura", "", function(data){
      objSensor.Crear(0,SENSOR_DIGITAL[pin], Date.now(), data.return_value);
      callback(objSensor.Objeto());
  });
};

//Usamos DHT 11 para leer temperatura y humedad
method.GetHumedad = function(pin, callback) {
  var objSensor = new SensorEntity();
  this.arduinoService.callFunction("Humedad", "", function(data) {
    objSensor.Crear(0, SENSOR_DIGITAL[pin], Date.now(), data.return_value);
      callback(objSensor.Objeto());
  });
};


method.GetEstadoSensorAnalogo = function(pin, callback) {
  VerificarPin(pin, 'analogo');
  this.arduinoService.analogRead(SENSOR_ANALOGO[pin], callback);
};

method.GetEstadoSensorDigital = function(pin, callback) {
  VerificarPin(pin, 'digital');
  this.arduinoService.digitalRead(SENSOR_DIGITAL[pin],  callback);
};

method.InfoTarjeta = function(callback) {
  this.arduinoService.boardInfo(dispositivo.ip,  callback);
}


/*
method.ActivarSensor = function(sensor, callback) {
  var jsonData = { active: 1, freq : 1000 }

  req.putJson('http://' + this.webduinoapi_host + ':' + this.webduinoapi_puerto+ARDUINO["SENSOR_X"]+sensor, jsonData).on('complete', function(data) {
    callback(data);
    return;
  });
};

method.DesactivarSensor = function(sensor, callback) {
 
 var jsonData = { "active": 0 }
 
  req.putJson('http://' + this.webduinoapi_host + ':' + this.webduinoapi_puerto+ARDUINO["SENSOR_X"]+sensor, jsonData).on('complete', function(data) {
    callback(data);
    return;
  });
};
*/

function VerificarPin(pin, modo)
{
  if (modo == 'analogo')
  {
    if (!SENSOR_ANALOGO[pin]) {
      console.log("El pin no esta disponible para ser ocupado como sensor analogo");
      throw new Error("El pin no esta disponible para ser ocupado como sensor analogo");
    }
  }
  else if (modo == 'digital')
  {
     if (!SENSOR_DIGITAL[pin]) {
      console.log("El pin no esta disponible para ser ocupado como sensor digital");
      throw new Error("El pin no esta disponible para ser ocupado como sensor digital");
    }
  }
  else
  {
    console.log("El pin no existe");
    throw new Error("El pin no existe");
  }
}


module.exports = SensorService;