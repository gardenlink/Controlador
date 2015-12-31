var method = Sensor.prototype;

var objSensor;

function Sensor() 
{
 objSensor = new Object({
    Id : Number
  , IdDispositivo : String
  , Pin : Number
  , TimeStamp      : { type: Date, default: Date.now }
  , Valor  : Number
  , Proposito : String
  , Ocupado : Boolean
});
}


method.Crear = function(id,idDispositivo, Pin, TimeStamp, Valor)
{
  
  objSensor.Id = id;
  objSensor.IdDispositivo = idDispositivo;
  objSensor.Pin = Pin;
  objSensor.TimeStamp = TimeStamp;
  objSensor.Valor = Valor;
  objSensor.Proposito = "";
  objSensor.Ocupado = true;
};

method.Objeto = function()
{
  return objSensor;
};

method.Modificar = function(id, idDispositivo, Pin, TimeStamp, Valor, Proposito, Ocupado)
{
  objSensor.Id = id;
  objSensor.IdDispositivo = idDispositivo;
  objSensor.Pin = Pin;
  objSensor.TimeStamp = TimeStamp;
  objSensor.Valor = Valor;
  objSensor.Proposito = Proposito;
  objSensor.Ocupado = Ocupado;
};

module.exports = Sensor;


