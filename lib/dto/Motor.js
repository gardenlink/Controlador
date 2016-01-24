var method = Motor.prototype;

var objMotor;

var estadoMotor = {
  0 : "Detenido",
  1 : "Avanzado",
  2 : "Retrocediendo"
}

function Motor() 
{
 objMotor = new Object({
    Id : Number
  , Pin : String
  , TimeStamp      : { type: Date, default: Date.now }
  , Valor  : Number
  , TiempoEncendida : Number //minutos
  , TiempoInicial : { type: Date, default: Date.now}
  , Proposito : String
  , Estado : String
  , Posicion : Number
});
}


method.Crear = function(id, Pin, TiempoEncendida, TiempoInicial,Estado,Posicion)
{
  
  objMotor.Id = id;
  objMotor.Pin = Pin;
  objMotor.TiempoEncendida = TiempoEncendida;
  objMotor.TiempoInicial = TiempoInicial;
  objMotor.Proposito = "";
  objMotor.Estado = Estado;
  objMotor.DescEstado = estadoMotor[Estado],
  objMotor.Posicion = Posicion;
};

method.Objeto = function()
{
  return objMotor;
};

method.Modificar = function(id, TiempoEncendida, TiempoInicial,Estado, Posicion)
{
  objMotor.Id = id;
  objMotor.TiempoEncendida = TiempoEncendida;
  objMotor.Proposito = Proposito;
  objMotor.TiempoInicial = TiempoInicial;
  objMotor.TiempoEncendida = TiempoEncendida;
  objMotor.Estado = Estado,
  objMotor.DescEstado = estadoMotor[Estado],
  objMotor.Posicion = Posicion;
};


module.exports = Motor;


